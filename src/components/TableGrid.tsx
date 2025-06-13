import { useEffect, useState } from 'react';

interface TableGridProps {
  onTableClick: (tableNumber: number) => void;
}

export default function TableGrid({ onTableClick }: TableGridProps) {
  const tables = Array.from({ length: 20 }, (_, i) => i + 1);
  const [occupiedTables, setOccupiedTables] = useState<{ [key: string]: { isOccupied: boolean, waiterName?: string } }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTableStatuses = async () => {
      try {
        const response = await fetch('/api/tables/status');
        if (!response.ok) {
          throw new Error('Не удалось получить статусы столиков');
        }
        const data = await response.json();
        setOccupiedTables(data);
      } catch (error) {
        console.error('Error fetching table statuses:', error);
        setError(error instanceof Error ? error.message : 'Ошибка при получении статусов столиков');
      }
    };

    fetchTableStatuses();
    // Обновляем статусы каждые 30 секунд
    const interval = setInterval(fetchTableStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {tables.map((tableNumber) => {
        const isOccupied = occupiedTables[tableNumber.toString()]?.isOccupied;
        const waiterName = occupiedTables[tableNumber.toString()]?.waiterName;
        return (
          <button
            key={tableNumber}
            onClick={() => onTableClick(tableNumber)}
            className={`relative aspect-square rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group ${
              isOccupied ? 'bg-red-100' : 'bg-white'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${
              isOccupied 
                ? 'from-red-50 to-red-100 opacity-0 group-hover:opacity-100'
                : 'from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100'
            } transition-opacity duration-200`} />
            <div className="relative h-full flex flex-col items-center justify-center p-4">
              <span className={`text-4xl font-bold mb-2 ${
                isOccupied ? 'text-red-800' : 'text-gray-800'
              }`}>
                {tableNumber}
              </span>
              <span className={`text-sm ${
                isOccupied ? 'text-red-600' : 'text-gray-600'
              }`}>
                {isOccupied ? 'Столик занят официантом' : 'Столик'}
              </span>
              {isOccupied && waiterName && (
                <span className="text-xs mt-1 font-medium text-blue-600">{waiterName}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
} 