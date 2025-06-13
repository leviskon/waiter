import { PrismaClient, Prisma } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request.error';
import { IngredientService } from './ingredient.service';

const prisma = new PrismaClient();
const ingredientService = new IngredientService();

interface OrderData {
  tableNumber: string;
  waiterId: string;
  shiftId: number;
  items: Array<{
    menuItemId: number;
    quantity: number;
  }>;
}

export class OrderService {
  async createOrder(data: OrderData, tx: Prisma.TransactionClient = prisma) {
    console.log('=== НАЧАЛО СОЗДАНИЯ ЗАКАЗА ===');
    console.log('Данные заказа:', data);

    try {
      // Проверяем наличие всех ингредиентов
      console.log('Проверка ингредиентов...');
      await ingredientService.checkAndUpdateIngredients(data.items, tx);

      // Создаем заказ
      const order = await tx.order.create({
        data: {
          tableNumber: data.tableNumber,
          waiterId: data.waiterId,
          shiftId: data.shiftId,
          status: 'OPEN',
          totalPrice: 0, // Будет обновлено после добавления позиций
          items: {
            create: data.items.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: 0, // Будет обновлено после получения цены
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

      // Обновляем цены и общую сумму заказа
      const totalPrice = order.items.reduce((sum, item) => {
        return sum + (Number(item.menuItem.price) * item.quantity);
      }, 0);

      await tx.order.update({
        where: { id: order.id },
        data: {
          totalPrice,
          items: {
            update: order.items.map(item => ({
              where: { id: item.id },
              data: { price: item.menuItem.price }
            }))
          }
        }
      });

      console.log('=== ЗАКАЗ УСПЕШНО СОЗДАН ===');
      return order;
    } catch (error) {
      console.error('=== ОШИБКА ПРИ СОЗДАНИИ ЗАКАЗА ===', error);
      throw error;
    }
  }
} 