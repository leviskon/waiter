import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Находим существующего менеджера
  const manager = await prisma.user.findFirst({
    where: {
      role: 'MANAGER'
    }
  });

  if (!manager) {
    throw new Error('Не найден пользователь с ролью MANAGER');
  }

  // Создаем ингредиенты
  const ingredients = await Promise.all([
    prisma.ingredient.create({
      data: {
        name: 'Мука пшеничная',
        unit: 'кг',
        currentPrice: 45.50,
        inStock: 100,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Сахар',
        unit: 'кг',
        currentPrice: 65.00,
        inStock: 50,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Соль',
        unit: 'кг',
        currentPrice: 30.00,
        inStock: 20,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Масло подсолнечное',
        unit: 'л',
        currentPrice: 120.00,
        inStock: 30,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Яйца',
        unit: 'шт',
        currentPrice: 12.00,
        inStock: 200,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Молоко',
        unit: 'л',
        currentPrice: 85.00,
        inStock: 50,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Сметана 20%',
        unit: 'кг',
        currentPrice: 180.00,
        inStock: 20,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Сливочное масло',
        unit: 'кг',
        currentPrice: 450.00,
        inStock: 15,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Куриное филе',
        unit: 'кг',
        currentPrice: 350.00,
        inStock: 25,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Говядина',
        unit: 'кг',
        currentPrice: 650.00,
        inStock: 20,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Свинина',
        unit: 'кг',
        currentPrice: 450.00,
        inStock: 25,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Рис',
        unit: 'кг',
        currentPrice: 120.00,
        inStock: 30,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Картофель',
        unit: 'кг',
        currentPrice: 45.00,
        inStock: 50,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Морковь',
        unit: 'кг',
        currentPrice: 35.00,
        inStock: 20,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Лук репчатый',
        unit: 'кг',
        currentPrice: 30.00,
        inStock: 20,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Чеснок',
        unit: 'кг',
        currentPrice: 200.00,
        inStock: 10,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Томаты',
        unit: 'кг',
        currentPrice: 180.00,
        inStock: 15,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Огурцы',
        unit: 'кг',
        currentPrice: 160.00,
        inStock: 15,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Сыр твердый',
        unit: 'кг',
        currentPrice: 650.00,
        inStock: 15,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Майонез',
        unit: 'кг',
        currentPrice: 180.00,
        inStock: 20,
      },
    }),
  ]);

  // Создаем категории меню
  const categories = await Promise.all([
    prisma.menuCategory.create({
      data: {
        name: 'Завтраки',
        description: 'Блюда для завтрака',
        createdById: manager.id,
      },
    }),
    prisma.menuCategory.create({
      data: {
        name: 'Супы',
        description: 'Первые блюда',
        createdById: manager.id,
      },
    }),
    prisma.menuCategory.create({
      data: {
        name: 'Горячие блюда',
        description: 'Основные блюда',
        createdById: manager.id,
      },
    }),
    prisma.menuCategory.create({
      data: {
        name: 'Гарниры',
        description: 'Дополнительные блюда',
        createdById: manager.id,
      },
    }),
    prisma.menuCategory.create({
      data: {
        name: 'Салаты',
        description: 'Холодные закуски',
        createdById: manager.id,
      },
    }),
    prisma.menuCategory.create({
      data: {
        name: 'Напитки',
        description: 'Горячие и холодные напитки',
        createdById: manager.id,
      },
    }),
    prisma.menuCategory.create({
      data: {
        name: 'Десерты',
        description: 'Сладкие блюда',
        createdById: manager.id,
      },
    }),
  ]);

  // Создаем блюда
  const menuItems = await Promise.all([
    // Завтраки
    prisma.menuItem.create({
      data: {
        name: 'Омлет с ветчиной и сыром',
        description: 'Воздушный омлет с начинкой из ветчины и сыра',
        price: 350.00,
        costPrice: 150.00,
        imageUrl: 'https://example.com/omelet.jpg',
        createdById: manager.id,
        categoryId: categories[0].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[4].id, quantity: 3 }, // Яйца
            { ingredientId: ingredients[18].id, quantity: 0.05 }, // Сыр
            { ingredientId: ingredients[7].id, quantity: 0.02 }, // Масло сливочное
          ],
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Блины со сметаной',
        description: 'Тонкие блины с домашней сметаной',
        price: 280.00,
        costPrice: 100.00,
        imageUrl: 'https://example.com/pancakes.jpg',
        createdById: manager.id,
        categoryId: categories[0].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[0].id, quantity: 0.2 }, // Мука
            { ingredientId: ingredients[4].id, quantity: 2 }, // Яйца
            { ingredientId: ingredients[5].id, quantity: 0.3 }, // Молоко
            { ingredientId: ingredients[6].id, quantity: 0.1 }, // Сметана
          ],
        },
      },
    }),
    // Супы
    prisma.menuItem.create({
      data: {
        name: 'Борщ',
        description: 'Традиционный украинский борщ со сметаной',
        price: 320.00,
        costPrice: 120.00,
        imageUrl: 'https://example.com/borscht.jpg',
        createdById: manager.id,
        categoryId: categories[1].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[12].id, quantity: 0.2 }, // Картофель
            { ingredientId: ingredients[13].id, quantity: 0.1 }, // Морковь
            { ingredientId: ingredients[14].id, quantity: 0.1 }, // Лук
            { ingredientId: ingredients[6].id, quantity: 0.05 }, // Сметана
          ],
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Суп-пюре грибной',
        description: 'Крем-суп из белых грибов',
        price: 380.00,
        costPrice: 180.00,
        imageUrl: 'https://example.com/mushroom-soup.jpg',
        createdById: manager.id,
        categoryId: categories[1].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[12].id, quantity: 0.2 }, // Картофель
            { ingredientId: ingredients[14].id, quantity: 0.1 }, // Лук
            { ingredientId: ingredients[7].id, quantity: 0.03 }, // Масло сливочное
            { ingredientId: ingredients[5].id, quantity: 0.2 }, // Молоко
          ],
        },
      },
    }),
    // Горячие блюда
    prisma.menuItem.create({
      data: {
        name: 'Стейк из говядины',
        description: 'Сочный стейк из мраморной говядины',
        price: 1200.00,
        costPrice: 500.00,
        imageUrl: 'https://example.com/steak.jpg',
        createdById: manager.id,
        categoryId: categories[2].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[9].id, quantity: 0.3 }, // Говядина
            { ingredientId: ingredients[7].id, quantity: 0.02 }, // Масло сливочное
            { ingredientId: ingredients[15].id, quantity: 0.01 }, // Чеснок
          ],
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Куриная грудка на гриле',
        description: 'Нежная куриная грудка с травами',
        price: 450.00,
        costPrice: 200.00,
        imageUrl: 'https://example.com/chicken.jpg',
        createdById: manager.id,
        categoryId: categories[2].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[8].id, quantity: 0.2 }, // Куриное филе
            { ingredientId: ingredients[3].id, quantity: 0.02 }, // Масло подсолнечное
            { ingredientId: ingredients[15].id, quantity: 0.01 }, // Чеснок
          ],
        },
      },
    }),
    // Гарниры
    prisma.menuItem.create({
      data: {
        name: 'Картофельное пюре',
        description: 'Воздушное пюре со сливочным маслом',
        price: 180.00,
        costPrice: 80.00,
        imageUrl: 'https://example.com/mashed-potatoes.jpg',
        createdById: manager.id,
        categoryId: categories[3].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[12].id, quantity: 0.2 }, // Картофель
            { ingredientId: ingredients[7].id, quantity: 0.03 }, // Масло сливочное
            { ingredientId: ingredients[5].id, quantity: 0.05 }, // Молоко
          ],
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Рис с овощами',
        description: 'Рис с морковью и луком',
        price: 150.00,
        costPrice: 70.00,
        imageUrl: 'https://example.com/rice.jpg',
        createdById: manager.id,
        categoryId: categories[3].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[11].id, quantity: 0.1 }, // Рис
            { ingredientId: ingredients[13].id, quantity: 0.05 }, // Морковь
            { ingredientId: ingredients[14].id, quantity: 0.05 }, // Лук
          ],
        },
      },
    }),
    // Салаты
    prisma.menuItem.create({
      data: {
        name: 'Цезарь с курицей',
        description: 'Классический салат с куриным филе',
        price: 450.00,
        costPrice: 200.00,
        imageUrl: 'https://example.com/caesar.jpg',
        createdById: manager.id,
        categoryId: categories[4].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[8].id, quantity: 0.15 }, // Куриное филе
            { ingredientId: ingredients[18].id, quantity: 0.05 }, // Сыр
            { ingredientId: ingredients[19].id, quantity: 0.03 }, // Майонез
          ],
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Греческий салат',
        description: 'Свежий салат с овощами и сыром фета',
        price: 380.00,
        costPrice: 180.00,
        imageUrl: 'https://example.com/greek-salad.jpg',
        createdById: manager.id,
        categoryId: categories[4].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[16].id, quantity: 0.1 }, // Томаты
            { ingredientId: ingredients[17].id, quantity: 0.1 }, // Огурцы
            { ingredientId: ingredients[14].id, quantity: 0.05 }, // Лук
          ],
        },
      },
    }),
    // Напитки
    prisma.menuItem.create({
      data: {
        name: 'Капучино',
        description: 'Классический итальянский кофе с молочной пенкой',
        price: 180.00,
        costPrice: 50.00,
        imageUrl: 'https://example.com/cappuccino.jpg',
        createdById: manager.id,
        categoryId: categories[5].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[5].id, quantity: 0.15 }, // Молоко
          ],
        },
      },
    }),
    // Десерты
    prisma.menuItem.create({
      data: {
        name: 'Тирамису',
        description: 'Итальянский десерт с кофе и маскарпоне',
        price: 350.00,
        costPrice: 150.00,
        imageUrl: 'https://example.com/tiramisu.jpg',
        createdById: manager.id,
        categoryId: categories[6].id,
        ingredients: {
          create: [
            { ingredientId: ingredients[4].id, quantity: 2 }, // Яйца
            { ingredientId: ingredients[1].id, quantity: 0.05 }, // Сахар
          ],
        },
      },
    }),
  ]);

  // Создаем смену на сегодня
  const now = new Date();
  const shift = await prisma.shift.create({
    data: {
      startedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0), // 9:00
      isActive: true,
      managerId: manager.id,
    },
  });

  // Создаем стоп-лист для некоторых ингредиентов
  await prisma.ingredientStopList.create({
    data: {
      ingredientId: ingredients[0].id, // Мука
      shiftId: shift.id,
    },
  });

  // Создаем стоп-лист для некоторых блюд
  await prisma.menuStopList.create({
    data: {
      menuItemId: menuItems[0].id, // Борщ
      shiftId: shift.id,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 