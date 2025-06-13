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
    });

    if (!currentShift) {
      return NextResponse.json(
        { error: 'Нет активной смены' },
        { status: 400 }
      );
    }

    // Получаем все ингредиенты
    const ingredients = await prisma.ingredient.findMany();

    // Проверяем каждый ингредиент
    for (const ingredient of ingredients) {
      // Если ингредиент закончился (количество = 0)
      if (ingredient.inStock <= 0) {
        // Проверяем, нет ли уже этого ингредиента в стоп-листе
        const existingIngredientStopList = await prisma.ingredientStopList.findFirst({
          where: {
            ingredientId: ingredient.id,
            shiftId: currentShift.id,
          },
        });

        // Если ингредиента нет в стоп-листе, добавляем его
        if (!existingIngredientStopList) {
          await prisma.ingredientStopList.create({
            data: {
              ingredientId: ingredient.id,
              shiftId: currentShift.id,
            },
          });

          // Находим все блюда, использующие этот ингредиент
          const menuItems = await prisma.menuItem.findMany({
            where: {
              isActive: true,
              ingredients: {
                some: {
                  ingredientId: ingredient.id,
                },
              },
            },
          });

          // Добавляем блюда в стоп-лист
          for (const menuItem of menuItems) {
            const existingMenuItemStopList = await prisma.menuStopList.findFirst({
              where: {
                menuItemId: menuItem.id,
                shiftId: currentShift.id,
              },
            });

            if (!existingMenuItemStopList) {
              await prisma.menuStopList.create({
                data: {
                  menuItemId: menuItem.id,
                  shiftId: currentShift.id,
                },
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating stop list:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении стоп-листа' },
      { status: 500 }
    );
  }
} 