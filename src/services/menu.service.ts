import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request.error';

const prisma = new PrismaClient();

export class MenuService {
  async checkMenuItemsAvailability(menuItems: Array<{ id: number }>) {
    const unavailableItems = [];

    for (const menuItem of menuItems) {
      try {
        // Получаем все ингредиенты для блюда
        const menuIngredients = await prisma.menuIngredient.findMany({
          where: { menuItemId: menuItem.id },
          include: { ingredient: true },
        });

        // Проверяем наличие всех ингредиентов
        for (const menuIngredient of menuIngredients) {
          const requiredQuantity = menuIngredient.quantity;
          const currentStock = menuIngredient.ingredient.inStock;

          if (currentStock < requiredQuantity) {
            unavailableItems.push({
              id: menuItem.id,
              name: menuItem.name,
              missingIngredient: {
                name: menuIngredient.ingredient.name,
                required: requiredQuantity,
                available: currentStock,
                unit: menuIngredient.ingredient.unit
              }
            });
            break; // Прерываем проверку, если хотя бы одного ингредиента не хватает
          }
        }
      } catch (error) {
        console.error(`Ошибка при проверке блюда ${menuItem.id}:`, error);
      }
    }

    return unavailableItems;
  }

  async addToStopList(menuItemId: number, shiftId: number) {
    // Проверяем, нет ли уже этого блюда в стоп-листе
    const existingStopList = await prisma.menuStopList.findFirst({
      where: {
        menuItemId,
        shiftId
      }
    });

    if (!existingStopList) {
      // Добавляем блюдо в стоп-лист
      await prisma.menuStopList.create({
        data: {
          menuItemId,
          shiftId
        }
      });
    }
  }
} 