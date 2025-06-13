import { PrismaClient, Prisma } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request.error';

const prisma = new PrismaClient();

interface OrderItem {
  menuItemId: number;
  quantity: number;
}

export class IngredientService {
  async checkAndUpdateIngredients(items: OrderItem[], tx: Prisma.TransactionClient = prisma) {
    for (const item of items) {
      // Получаем все ингредиенты для блюда
      const menuIngredients = await tx.menuIngredient.findMany({
        where: { menuItemId: item.menuItemId },
        include: { ingredient: true },
      });

      // Проверяем наличие всех ингредиентов
      for (const menuIngredient of menuIngredients) {
        const requiredQuantity = menuIngredient.quantity * item.quantity;
        const currentStock = menuIngredient.ingredient.inStock;

        if (currentStock < requiredQuantity) {
          throw new BadRequestError(
            `Недостаточно ингредиента "${menuIngredient.ingredient.name}". Требуется: ${requiredQuantity} ${menuIngredient.ingredient.unit}, доступно: ${currentStock} ${menuIngredient.ingredient.unit}`
          );
        }

        // Обновляем количество ингредиента
        await tx.ingredient.update({
          where: { id: menuIngredient.ingredient.id },
          data: {
            inStock: {
              decrement: requiredQuantity
            }
          }
        });
      }
    }
  }
} 