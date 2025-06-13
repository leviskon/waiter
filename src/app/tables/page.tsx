import React, { useState, useEffect } from 'react';
import MenuModal from '../components/MenuModal';

interface Table {
  number: number;
  isOccupied: boolean;
  waiterName?: string | null;
}

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables/status');
      const data = await response.json();
      // data может быть объектом { [tableNumber]: { isOccupied, waiterName } }
      // Преобразуем в массив для рендера
      const tablesArr: Table[] = Array.from({ length: 20 }, (_, i) => {
        const num = i + 1;
        const info = data[num] || {};
        return {
          number: num,
          isOccupied: !!info.isOccupied,
          waiterName: info.waiterName || null
        };
      });
      setTables(tablesArr);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleTableClick = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setSelectedTable(null);
  };

  const handleOrderCreated = () => {
    fetchTables(); // Обновляем состояние столиков после создания заказа
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Столы</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map((table) => (
          <div
            key={table.number}
            onClick={() => handleTableClick(table.number)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-colors duration-200 ${
              table.isOccupied
                ? 'border-red-200 bg-red-50'
                : 'border-gray-100 hover:border-purple-200'
            }`}
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Стол {table.number}</h3>
              <p className={`text-sm ${
                table.isOccupied ? 'text-red-600' : 'text-green-600'
              }`}>
                {table.isOccupied ? 'Занят' : 'Свободен'}
              </p>
              {table.isOccupied && table.waiterName && (
                <p className="text-xs text-red-700 mt-1">Официант: {table.waiterName}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTable && (
        <MenuModal
          isOpen={isMenuOpen}
          onClose={handleMenuClose}
          tableNumber={selectedTable}
          onCreateOrder={handleOrderCreated}
          onOrderCreated={handleOrderCreated}
        />
      )}

      <div className="flex justify-center mt-10">
        <button
          onClick={() => window.location.href = '/dashboard/reports'}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-200 hover:shadow-xl text-lg font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Отчёт
        </button>
      </div>
    </div>
  );
} 