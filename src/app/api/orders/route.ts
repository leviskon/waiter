import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { OrderService } from '@/services/order.service';

const orderService = new OrderService();

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { tableNumber, items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Некорректный формат данных заказа' },
        { status: 400 }
      );
    }

    // Проверяем, нет ли уже активного заказа на этот стол
    const activeOrder = await prisma.order.findFirst({
      where: {
        tableNumber: tableNumber.toString(),
        status: 'OPEN',
        shift: {
          isActive: true
        }
      }
    });

    if (activeOrder) {
      return NextResponse.json(
        { error: 'Стол уже занят' },
        { status: 400 }
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

    // Преобразуем данные заказа в нужный формат
    const orderData = {
      tableNumber: tableNumber.toString(),
      waiterId: user.id,
      shiftId: activeShift.id,
      items: items.map((item: any) => ({
        menuItemId: item.id,
        quantity: item.quantity
      }))
    };

    // Создаем заказ
    const order = await orderService.createOrder(orderData);

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка при создании заказа' },
      { status: 500 }
    );
  }
} 