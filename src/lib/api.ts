const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiOptions extends RequestInit {
  token?: string;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  // Если токен не передан, пробуем получить из localStorage
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
    mode: 'cors', // Добавляем режим CORS
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка при выполнении запроса');
  }

  return response.json();
}

// Вспомогательные функции для разных типов запросов
export const apiGet = <T>(endpoint: string, options?: ApiOptions) => 
  api<T>(endpoint, { ...options, method: 'GET' });

export const apiPost = <T>(endpoint: string, data: any, options?: ApiOptions) =>
  api<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiPut = <T>(endpoint: string, data: any, options?: ApiOptions) =>
  api<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const apiDelete = <T>(endpoint: string, options?: ApiOptions) =>
  api<T>(endpoint, { ...options, method: 'DELETE' });

export const apiPatch = <T>(endpoint: string, data: any, options?: ApiOptions) =>
  api<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// Функции для работы с заказами
export interface OrderItem {
  menuItemId: number;
  quantity: number;
}

export interface Order {
  id: number;
  tableNumber: number;
  items: OrderItem[];
  status: string;
  totalPrice: number;
  createdAt: string;
}

export const createOrder = (tableNumber: number, items: OrderItem[]) =>
  apiPost<Order>('/api/orders', { tableNumber, items });

export const updateOrder = (orderId: number, items: OrderItem[]) =>
  apiPatch<Order>(`/api/orders/${orderId}`, { items });

export const getOrder = (orderId: number) =>
  apiGet<Order>(`/api/orders/${orderId}`); 