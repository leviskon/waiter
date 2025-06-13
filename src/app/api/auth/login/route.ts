import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { encrypt } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Необходимо указать логин и пароль' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    const isValidPassword = await compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    const activeShift = await prisma.shift.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!activeShift) {
      return NextResponse.json(
        { error: 'Нет активной смены' },
        { status: 403 }
      );
    }

    const isAssignedToShift = await prisma.shiftStaff.findFirst({
      where: {
        shiftId: activeShift.id,
        userId: user.id,
      },
    });

    if (!isAssignedToShift) {
      return NextResponse.json(
        { error: 'Вы не назначены на текущую смену' },
        { status: 403 }
      );
    }

    const token = await encrypt({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 часа
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
} 