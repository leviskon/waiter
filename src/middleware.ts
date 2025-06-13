import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Используем тот же секретный ключ, что и в auth.ts
const secretKey = process.env.JWT_SECRET || 'your-secret-key';
const key = new TextEncoder().encode(secretKey);

// Пути, которые не требуют аутентификации
const publicPaths = ['/', '/api/auth/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');

  // Пропускаем публичные пути
  if (publicPaths.includes(pathname)) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MIDDLEWARE] Публичный путь: ${pathname}, пропуск`);
    }
    return NextResponse.next();
  }

  // Получаем токен из cookies
  const token = request.cookies.get('token')?.value;

  if (!token) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[MIDDLEWARE] Нет токена в cookies для ${isApi ? 'API' : 'страницы'}: ${pathname}`);
    }
    if (isApi) {
      return new NextResponse(
        JSON.stringify({ error: 'Требуется авторизация' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          } 
        }
      );
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Проверяем токен
    const verified = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    if (process.env.NODE_ENV !== 'production') {
      const { username, role, exp } = verified.payload as any;
      const expDate = exp ? new Date(exp * 1000).toLocaleString() : 'n/a';
      console.log(`[MIDDLEWARE] Токен валиден для пользователя: ${username} (${role}), истекает: ${expDate}`);
    }
    return NextResponse.next();
  } catch (error) {
    console.error(`[MIDDLEWARE] Ошибка проверки токена для ${isApi ? 'API' : 'страницы'} ${pathname}:`, error);
    if (isApi) {
      return new NextResponse(
        JSON.stringify({ error: 'Недействительный токен' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          } 
        }
      );
    }
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Указываем, для каких путей применять middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 