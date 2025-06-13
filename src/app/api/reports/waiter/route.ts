import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { OrderStatus } from '@prisma/client';
import Decimal from 'decimal.js';

const periods = [
  { key: 'day', label: 'День' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
];

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    console.log('Пользователь в API отчётов:', user);

    const waiterId = user.id;
    const waiterName = user.fullName;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'day';

    let startDate: Date;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case 'day':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
    }

    const orders = await prisma.order.findMany({
      where: {
        waiterId: waiterId,
        status: OrderStatus.PAID,
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        totalPrice: true,
      },
    });

    const totalOrders = orders.length;
    const totalSum = orders.reduce((sum, order) => sum.plus(new Decimal(order.totalPrice.toString())), new Decimal(0));

    const waiterSalarySetting = await prisma.settings.findUnique({
      where: { key: 'waiterSalary' },
    });
    const waiterPercentSetting = await prisma.settings.findUnique({
      where: { key: 'waiterPercent' },
    });

    const waiterSalary = new Decimal(waiterSalarySetting?.value || '0');
    const waiterPercent = new Decimal(waiterPercentSetting?.value || '0');

    const waiterPayout = waiterSalary.plus(totalSum.times(waiterPercent).div(100));

    const label = periods.find(p => p.key === period)?.label || 'Отчёт';

    console.log('Отправка отчёта для официанта:', { waiter: waiterName, period, totalOrders, totalSum: totalSum.toNumber(), waiterPayout: waiterPayout.toNumber() });

    return NextResponse.json({
      orders: totalOrders,
      total: totalSum.toNumber(),
      waiterPayout: waiterPayout.toNumber(),
      waiter: waiterName,
      label: `Отчёт ${label.toLowerCase()}`,
    });

  } catch (error) {
    console.error('Error fetching waiter report:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении отчёта официанта' },
      { status: 500 }
    );
  }
} 