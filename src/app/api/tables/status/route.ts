import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { OrderStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
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

    // Получаем все активные заказы с официантом
    const activeOrders = await prisma.order.findMany({
      where: {
        shiftId: activeShift.id,
        status: OrderStatus.OPEN,
      },
      select: {
        tableNumber: true,
        waiter: {
          select: {
            fullName: true
          }
        }
      },
    });

    // Создаем объект с занятыми столиками и именем официанта
    const occupiedTables = activeOrders.reduce((acc: { [key: string]: { isOccupied: boolean, waiterName?: string } }, order) => {
      acc[order.tableNumber] = {
        isOccupied: true,
        waiterName: order.waiter?.fullName || null
      };
      return acc;
    }, {});

    return NextResponse.json(occupiedTables);
  } catch (error) {
    console.error('Error fetching table statuses:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении статусов столиков' },
      { status: 500 }
    );
  }
} 