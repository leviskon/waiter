import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Получаем текущую активную смену
    const currentShift = await prisma.shift.findFirst({
      where: {
        isActive: true,
      },
      include: {
        menuStopList: {
          include: {
            menuItem: true,
          },
        },
        ingredientStopList: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!currentShift) {
      return NextResponse.json(
        { error: 'Нет активной смены' },
        { status: 400 }
      );
    }

    // Получаем все блюда с их ингредиентами
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isActive: true,
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    // Проверяем доступность каждого блюда
    const unavailableItems = [];

    for (const item of menuItems) {
      // Проверяем, не в стоп-листе ли блюдо
      const isInStopList = currentShift.menuStopList.some(
        (stopItem) => stopItem.menuItemId === item.id
      );

      if (isInStopList) {
        unavailableItems.push({
          id: item.id,
          reason: 'Блюдо временно недоступно',
        });
        continue;
      }

      // Проверяем наличие всех ингредиентов
      let isUnavailable = false;
      let unavailableReason = '';

      for (const menuIngredient of item.ingredients) {
        const ingredient = menuIngredient.ingredient;
        
        // Проверяем, не в стоп-листе ли ингредиент
        const isIngredientInStopList = currentShift.ingredientStopList.some(
          (stopItem) => stopItem.ingredientId === ingredient.id
        );

        if (isIngredientInStopList) {
          isUnavailable = true;
          unavailableReason = `Нет ингредиента: ${ingredient.name}`;
          break;
        }

        // Проверяем достаточное количество ингредиента
        if (ingredient.inStock < menuIngredient.quantity) {
          isUnavailable = true;
          unavailableReason = `Недостаточно ингредиента: ${ingredient.name}`;
          
          // Добавляем блюдо в стоп-лист
          const existingMenuItemStopList = await prisma.menuStopList.findFirst({
            where: {
              menuItemId: item.id,
              shiftId: currentShift.id,
            },
          });

          if (!existingMenuItemStopList) {
            await prisma.menuStopList.create({
              data: {
                menuItemId: item.id,
                shiftId: currentShift.id,
              },
            });
          }
          
          break;
        }
      }

      if (isUnavailable) {
        unavailableItems.push({
          id: item.id,
          reason: unavailableReason,
        });
      }
    }

    return NextResponse.json({ unavailableItems });
  } catch (error) {
    console.error('Error checking menu availability:', error);
    return NextResponse.json(
      { error: 'Ошибка при проверке доступности блюд' },
      { status: 500 }
    );
  }
} 