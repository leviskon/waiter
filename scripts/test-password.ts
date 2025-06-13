import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testPassword() {
  try {
    // Создаем тестового пользователя с хешированным паролем
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: 'test_waiter',
        fullName: 'Test Waiter',
        passwordHash: hashedPassword,
        role: 'WAITER',
      },
    });

    console.log('Created test user:', user);

    // Проверяем пароль
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log('Password validation result:', isValid);

    // Проверяем неправильный пароль
    const isInvalid = await bcrypt.compare('wrongpassword', user.passwordHash);
    console.log('Wrong password validation result:', isInvalid);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword(); 