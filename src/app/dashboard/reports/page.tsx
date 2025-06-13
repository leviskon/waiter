'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenu from '@/components/BurgerMenu';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

interface ReportData {
  orders: number;
  total: number;
  waiterPayout: number;
  waiter: string;
  label: string;
}

const periods = [
  { key: 'day', label: 'День' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
];

export default function ReportsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('day');
  const [report, setReport] = useState<ReportData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Ошибка авторизации');
        }

        const userData = await response.json();
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
    if (!user) return;

    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/reports/waiter?period=${period}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Не удалось загрузить отчёт');
        }
        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке отчёта');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [period, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
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
          {!report ? (
            <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
              <div className="text-gray-600">Нет данных для отчёта</div>
            </div>
          ) : (
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <h1 className="text-3xl font-bold text-gray-900">Отчёты официанта</h1>
              </div>
              <div className="flex justify-center gap-4 mb-8">
                {periods.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPeriod(p.key)}
                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 border-2 ${period === p.key ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="w-full mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{report.label}</h2>
                <div className="bg-purple-50 rounded-lg p-4 shadow-inner mb-4">
                  <ul className="text-gray-700 space-y-2">
                    <li>• Всего заказов: <span className="font-bold">{report.orders}</span></li>
                    <li>• Общая сумма: <span className="font-bold">{report.total.toLocaleString()} сом</span></li>
                    <li>• Выручка официанта: <span className="font-bold">{report.waiterPayout.toLocaleString()} сом</span></li>
                    <li>• Официант: <span className="font-bold">{report.waiter}</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="flex justify-center mt-6 mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-lg font-semibold shadow-md transition-all duration-200"
        >
          ← Назад в панель
        </button>
      </div>
    </div>
  );
} 