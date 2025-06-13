import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { OrderStatus } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { tableNumber: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    // Получаем активную смену
    const activeShift = await prisma.shift.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!activeShift) {
      return NextResponse.json(
        { error: 'Нет активной смены' },
        { status: 400 }
      );
    }

    // Ищем заказ для указанного столика в текущей смене
    const order = await prisma.order.findFirst({
      where: {
        tableNumber: params.tableNumber,
        shiftId: activeShift.id,
        status: OrderStatus.OPEN,
      },
      select: {
        id: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            price: true,
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(null);
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching table order:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заказа' },
      { status: 500 }
    );
  }
} 