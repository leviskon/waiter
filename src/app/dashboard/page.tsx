'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TableGrid from '@/components/TableGrid';
import MenuModal from '@/components/MenuModal';
import BurgerMenu from '@/components/BurgerMenu';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface Category {
  id: number;
  name: string;
  items: MenuItem[];
}

interface Order {
  id: number;
  items: Array<{
    menuItem: MenuItem;
    quantity: number;
    price: number;
  }>;
  status: 'OPEN' | 'PAID' | 'CANCELLED';
  totalPrice: number;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: number }>({});
  const [existingOrder, setExistingOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Проверка авторизации...');
        const response = await fetch('/api/auth/verify', {
          credentials: 'include', // Важно для работы с cookies
        });

        if (!response.ok) {
          throw new Error('Ошибка авторизации');
        }

        const userData = await response.json();
        console.log('Получены данные пользователя:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        setError('Ошибка авторизации');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/menu/categories');
        if (!response.ok) {
          throw new Error('Не удалось загрузить категории');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Не удалось загрузить меню');
      }
    };

    if (user) {
      fetchCategories();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      // Удаляем cookie с токеном
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleTableClick = async (tableNumber: number) => {
    try {
      setSelectedTable(tableNumber);
      setSelectedItems({});
      setExistingOrder(null);
      setError(null);

      const response = await fetch(`/api/orders/table/${tableNumber}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при получении заказа');
      }

      const order = await response.json();
      setExistingOrder(order);
      setIsMenuOpen(true);
    } catch (error) {
      console.error('Error fetching table order:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при получении заказа');
    }
  };

  const handleAddToExistingOrder = async (items: { [key: number]: number }) => {
    try {
      if (!existingOrder) return;

      const response = await fetch(`/api/orders/${existingOrder.id}/add-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при добавлении позиций к заказу');
      }

      const updatedOrder = await response.json();
      setExistingOrder(updatedOrder);
      setSelectedItems({});
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error adding items to order:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при добавлении позиций к заказу');
    }
  };

  const handleAddToOrder = (itemId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleRemoveFromOrder = (itemId: number) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (newItems[itemId] > 1) {
        newItems[itemId]--;
      } else {
        delete newItems[itemId];
      }
      return newItems;
    });
  };

  const handleCreateOrder = async () => {
    if (!selectedTable || !user) return;

    try {
      setError(null);

      const items = Object.entries(selectedItems).map(([itemId, quantity]) => {
        const item = categories
          .flatMap(cat => cat.items)
          .find(item => item.id === parseInt(itemId));
        return {
          id: parseInt(itemId),
          quantity,
          price: item?.price || 0
        };
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Используем cookies вместо токена в заголовке
        body: JSON.stringify({
          tableNumber: selectedTable,
          items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании заказа');
      }

      setSelectedItems({});
      setIsMenuOpen(false);
      setSelectedTable(null);
      setExistingOrder(data);
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при создании заказа');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsBurgerMenuOpen(true)}
              className="p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu" 
              aria-expanded="false"
            >
              <span className="sr-only">Открыть главное меню</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {user?.fullName}
            </h1>
          </div>
        </div>
      </header>

      <BurgerMenu 
        isOpen={isBurgerMenuOpen}
        onClose={() => setIsBurgerMenuOpen(false)}
        fullName={user?.fullName || ''}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <TableGrid onTableClick={handleTableClick} />
        </div>
      </main>

      {(isMenuOpen || isOrderOpen) && selectedTable && (
        <MenuModal
          isOpen={isMenuOpen || isOrderOpen}
          onClose={() => {
            setIsMenuOpen(false);
            setIsOrderOpen(false);
            setSelectedTable(null);
            setSelectedItems({});
            setError(null);
          }}
          categories={categories}
          selectedItems={selectedItems}
          onAddItem={handleAddToOrder}
          onRemoveItem={handleRemoveFromOrder}
          onCreateOrder={handleCreateOrder}
          onAddToExistingOrder={handleAddToExistingOrder}
          tableNumber={selectedTable}
          existingOrder={existingOrder}
        />
      )}
    </div>
  );
} 