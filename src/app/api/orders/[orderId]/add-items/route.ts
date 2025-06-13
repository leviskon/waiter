import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { OrderService } from '@/services/order.service';
import { IngredientService } from '@/services/ingredient.service';

const orderService = new OrderService();
const ingredientService = new IngredientService();

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Некорректный формат данных' },
        { status: 400 }
      );
    }

    // Проверяем наличие всех ингредиентов
    await ingredientService.checkAndUpdateIngredients(items);

    // Добавляем позиции к заказу
    const order = await prisma.order.update({
      where: {
        id: parseInt(params.orderId)
      },
      data: {
        items: {
          create: items.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    // Обновляем общую сумму заказа
    const totalPrice = order.items.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity);
    }, 0);

    await prisma.order.update({
      where: { id: order.id },
      data: { totalPrice }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error adding items to order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка при добавлении позиций к заказу' },
      { status: 500 }
    );
  }
} 