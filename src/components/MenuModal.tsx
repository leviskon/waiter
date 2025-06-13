import { Fragment, useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { MenuItem, MenuCategory } from '@prisma/client';
import SuccessModal from './SuccessModal';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: (MenuCategory & {
    menuItems: MenuItem[];
  })[];
  tableNumber: number;
  existingOrder?: {
    id: number;
    items: Array<{
      menuItem: MenuItem;
      quantity: number;
      price: number;
    }>;
    status: string;
    totalPrice: number;
    createdAt: string;
  } | null;
  onOrderCreated?: () => void;
}

export default function MenuModal({
  isOpen,
  onClose,
  categories,
  tableNumber,
  existingOrder,
  onOrderCreated,
}: MenuModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    categories[0]?.id || null
  );
  const [isAddingToExistingOrder, setIsAddingToExistingOrder] = useState(false);
  const [unavailableItems, setUnavailableItems] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: number }>({});

  // Функция для проверки доступности блюд
  const checkMenuAvailability = async () => {
    try {
      setIsLoading(true);
      
      // Сначала обновляем стоп-лист
      const stopListResponse = await fetch('/api/menu/stop-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!stopListResponse.ok) {
        throw new Error('Ошибка при обновлении стоп-листа');
      }

      // Затем проверяем доступность блюд
      const availabilityResponse = await fetch('/api/menu/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!availabilityResponse.ok) {
        throw new Error('Ошибка при проверке доступности блюд');
      }

      const data = await availabilityResponse.json();
      const unavailableMap = data.unavailableItems.reduce((acc: { [key: number]: string }, item: any) => {
        acc[item.id] = item.reason;
        return acc;
      }, {});
      setUnavailableItems(unavailableMap);
    } catch (error) {
      console.error('Error checking menu availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Проверяем доступность блюд при открытии меню
  useEffect(() => {
    if (isOpen) {
      checkMenuAvailability();
    }
  }, [isOpen]);

  const handleAddItem = (itemId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleRemoveItem = (itemId: number) => {
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

  // --- Группировка одинаковых блюд ---
  const groupedOrderItems = existingOrder
    ? Object.values(
        existingOrder.items.reduce((acc, item) => {
          const id = item.menuItem.id;
          if (!acc[id]) {
            acc[id] = { ...item, quantity: 0 };
          }
          acc[id].quantity += item.quantity;
          return acc;
        }, {} as Record<number, typeof existingOrder.items[0]>)
      )
    : [];

  const handleAddToExistingOrder = async () => {
    try {
      setIsLoading(true);
      const items = Object.entries(selectedItems).map(([id, quantity]) => ({
        id: parseInt(id),
        quantity,
        price: categories
          .flatMap(cat => cat.menuItems)
          .find(item => item.id === parseInt(id))?.price || 0
      }));

      const response = await fetch(`/api/orders/${existingOrder?.id}/add-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при добавлении позиций к заказу');
      }

      setIsAddingToExistingOrder(false);
      setSelectedItems({});
      setShowSuccessModal(true);
      if (onOrderCreated) {
        onOrderCreated();
      }
    } catch (error) {
      console.error('Error adding items to order:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при добавлении позиций к заказу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      setIsLoading(true);
      const items = Object.entries(selectedItems).map(([id, quantity]) => ({
        id: parseInt(id),
        quantity
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber,
          items
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при создании заказа');
      }

      setShowSuccessModal(true);
      if (onOrderCreated) {
        onOrderCreated();
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при создании заказа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const totalAmount = Object.entries(selectedItems).reduce((sum, [itemId, quantity]) => {
    const item = categories
      .flatMap(cat => cat.menuItems)
      .find(item => item.id === parseInt(itemId));
    const price = Number(item?.price || 0);
    return sum + (price * quantity);
  }, 0);

  return (
    <>
      <Dialog as="div" className="relative z-50" onClose={onClose} open={isOpen}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-4 md:p-6 text-left align-middle shadow-xl transition-all">
              <div className="flex justify-center items-center mb-4 md:mb-6 border-b pb-4">
                <Dialog.Title
                  as="h3"
                  className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center"
                >
                  <span className="text-blue-900">Столик {tableNumber}</span>
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 md:h-6 md:w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <>
                  {existingOrder ? (
                    <div className="mb-6 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-semibold text-gray-900">
                          Текущий заказ
                        </h4>
                        <div className="text-sm font-medium bg-blue-500 text-white px-2.5 py-1 rounded-lg shadow-sm">
                          {new Date(existingOrder.createdAt).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      {!isAddingToExistingOrder ? (
                        <>
                          <div className="space-y-3">
                            {groupedOrderItems.map((item, index) => (
                              <div
                                key={item.menuItem.id}
                                className="flex justify-between items-center bg-blue-50 p-3 rounded-xl border-2 border-blue-100 hover:border-blue-200 transition-colors duration-200"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-7 h-7 flex items-center justify-center bg-gray-900 text-white rounded-lg text-base font-medium shadow-sm">
                                    {item.quantity}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{item.menuItem.name}</span>
                                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-end md:items-center">
                                      <span className="text-sm text-gray-500">{Number(item.price)} сом за шт.</span>
                                      <span className="font-bold text-lg text-gray-900">{Number(item.price) * item.quantity} сом</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="font-bold text-lg text-gray-900">{Number(item.price) * item.quantity} сом</span>
                                  <span className="text-sm text-gray-500">Всего</span>
                                </div>
                              </div>
                            ))}
                            <div className="border-t-2 border-gray-900/10 mt-6 pt-6">
                              <div className="flex justify-between items-center bg-purple-600 p-4 rounded-xl text-white shadow-lg">
                                <span className="text-lg font-medium">Итого:</span>
                                <span className="text-3xl font-bold">{Number(existingOrder.totalPrice)} сом</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 pt-6 border-t-2 border-gray-900/10">
                            <button
                              onClick={() => setIsAddingToExistingOrder(true)}
                              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Добавить к заказу
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                            {/* Категории */}
                            <div className="w-full md:w-1/4 shrink-0">
                              <h4 className="text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Категории</h4>
                              <div className="flex md:block overflow-x-auto scrollbar-hide md:overflow-x-visible -mx-4 md:mx-0 px-4 md:px-0 pb-2 md:pb-0 space-x-2 md:space-x-0 md:space-y-2">
                                {categories.map((category) => (
                                  <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`flex-shrink-0 md:w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 ${
                                      selectedCategory === category.id
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                        : 'hover:bg-gray-50 text-gray-700 border border-gray-100'
                                    }`}
                                  >
                                    {category.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Блюда */}
                            <div className="w-full">
                              <h4 className="text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Меню</h4>
                              <div className="grid grid-cols-1 gap-3 md:gap-4 overflow-y-auto max-h-[60vh] md:max-h-[65vh] pr-1">
                                {categories
                                  .find((cat) => cat.id === selectedCategory)
                                  ?.menuItems?.map((item: MenuItem) => (
                                    <div
                                      key={item.id}
                                      className={`relative p-4 rounded-xl border-2 transition-colors duration-200 ${
                                        unavailableItems[item.id]
                                          ? 'border-red-200 bg-red-50 opacity-75'
                                          : 'border-gray-100 hover:border-purple-200'
                                      }`}
                                    >
                                      <div className="flex justify-between items-start gap-4 mb-2">
                                        <h4 className="font-semibold text-gray-900 leading-tight">
                                          {item.name}
                                        </h4>
                                        <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-end md:items-center">
                                          <span className="font-medium text-gray-900">
                                            {Number(item.price)} сом
                                          </span>
                                          <span className="font-bold text-lg text-gray-900">{Number(item.price) * (selectedItems[item.id] || 0)} сом</span>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {item.description}
                                      </p>
                                      {unavailableItems[item.id] && (
                                        <div className="mb-3 bg-red-500 text-white text-xs px-2 py-1 rounded inline-block">
                                          {unavailableItems[item.id]}
                                        </div>
                                      )}
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={!selectedItems[item.id] || !!unavailableItems[item.id]}
                                            className={`p-1.5 rounded-lg transition-colors duration-200 ${
                                              selectedItems[item.id] && !unavailableItems[item.id]
                                                ? 'text-red-600 hover:bg-red-50'
                                                : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-5 w-5 md:h-6 md:w-6"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M20 12H4"
                                              />
                                            </svg>
                                          </button>
                                          <span className="font-medium text-gray-700 min-w-[24px] text-center">
                                            {selectedItems[item.id] || 0}
                                          </span>
                                          <button
                                            onClick={() => handleAddItem(item.id)}
                                            disabled={!!unavailableItems[item.id]}
                                            className={`p-1.5 rounded-lg transition-colors duration-200 ${
                                              unavailableItems[item.id]
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-green-600 hover:bg-green-50'
                                            }`}
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-5 w-5 md:h-6 md:w-6"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4v16m8-8H4"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                        {selectedItems[item.id] > 0 && (
                                          <span className="font-semibold text-blue-600 bg-blue-50/50 px-2 py-1 rounded-lg">
                                            {Number(item.price) * selectedItems[item.id]} сом
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>

                          {/* Кнопки управления дополнительным заказом */}
                          {Object.keys(selectedItems).length > 0 && (
                            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t-2 border-gray-900/10">
                              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-purple-600 p-4 md:p-6 rounded-xl text-white shadow-lg">
                                <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-4">
                                  <span className="text-lg font-medium">Добавить на сумму:</span>
                                  <span className="text-2xl md:text-3xl font-bold">
                                    {Number(totalAmount)} сом
                                  </span>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                  <button
                                    onClick={() => setIsAddingToExistingOrder(false)}
                                    className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 transition-all duration-200"
                                  >
                                    Отмена
                                  </button>
                                  <button
                                    onClick={handleAddToExistingOrder}
                                    className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 transition-all duration-200"
                                  >
                                    Добавить к заказу
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      {/* Категории */}
                      <div className="w-full md:w-1/4 shrink-0">
                        <h4 className="text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Категории</h4>
                        <div className="flex md:block overflow-x-auto scrollbar-hide md:overflow-x-visible -mx-4 md:mx-0 px-4 md:px-0 pb-2 md:pb-0 space-x-2 md:space-x-0 md:space-y-2">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => setSelectedCategory(category.id)}
                              className={`flex-shrink-0 md:w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 ${
                                selectedCategory === category.id
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                  : 'hover:bg-gray-50 text-gray-700 border border-gray-100'
                              }`}
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Блюда */}
                      <div className="w-full">
                        <h4 className="text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Меню</h4>
                        <div className="grid grid-cols-1 gap-3 md:gap-4 overflow-y-auto max-h-[60vh] md:max-h-[65vh] pr-1">
                          {categories
                            .find((cat) => cat.id === selectedCategory)
                            ?.menuItems?.map((item: MenuItem) => (
                              <div
                                key={item.id}
                                className={`relative p-4 rounded-xl border-2 transition-colors duration-200 ${
                                  unavailableItems[item.id]
                                    ? 'border-red-200 bg-red-50 opacity-75'
                                    : 'border-gray-100 hover:border-purple-200'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-4 mb-2">
                                  <h4 className="font-semibold text-gray-900 leading-tight">
                                    {item.name}
                                  </h4>
                                  <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-end md:items-center">
                                    <span className="font-medium text-gray-900">
                                      {Number(item.price)} сом
                                    </span>
                                    <span className="font-bold text-lg text-gray-900">{Number(item.price) * (selectedItems[item.id] || 0)} сом</span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {item.description}
                                </p>
                                {unavailableItems[item.id] && (
                                  <div className="mb-3 bg-red-500 text-white text-xs px-2 py-1 rounded inline-block">
                                    {unavailableItems[item.id]}
                                  </div>
                                )}
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleRemoveItem(item.id)}
                                      disabled={!selectedItems[item.id] || !!unavailableItems[item.id]}
                                      className={`p-1.5 rounded-lg transition-colors duration-200 ${
                                        selectedItems[item.id] && !unavailableItems[item.id]
                                          ? 'text-red-600 hover:bg-red-50'
                                          : 'text-gray-300 cursor-not-allowed'
                                      }`}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 md:h-6 md:w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M20 12H4"
                                        />
                                      </svg>
                                    </button>
                                    <span className="font-medium text-gray-700 min-w-[24px] text-center">
                                      {selectedItems[item.id] || 0}
                                    </span>
                                    <button
                                      onClick={() => handleAddItem(item.id)}
                                      disabled={!!unavailableItems[item.id]}
                                      className={`p-1.5 rounded-lg transition-colors duration-200 ${
                                        unavailableItems[item.id]
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : 'text-green-600 hover:bg-green-50'
                                      }`}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 md:h-6 md:w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 4v16m8-8H4"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                  {selectedItems[item.id] > 0 && (
                                    <span className="font-semibold text-blue-600 bg-blue-50/50 px-2 py-1 rounded-lg">
                                      {Number(item.price) * selectedItems[item.id]} сом
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Итого и кнопка заказа */}
                  {!existingOrder && Object.keys(selectedItems).length > 0 && (
                    <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t-2 border-gray-900/10">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-purple-600 p-4 md:p-6 rounded-xl text-white shadow-lg">
                        <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-4">
                          <span className="text-lg font-medium">Итого:</span>
                          <span className="text-2xl md:text-3xl font-bold">
                            {Number(totalAmount)} сом
                          </span>
                        </div>
                        <button
                          onClick={handleCreateOrder}
                          disabled={isLoading}
                          className="w-full md:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900"></div>
                              <span>Создание заказа...</span>
                            </div>
                          ) : (
                            'Оформить заказ'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        tableNumber={tableNumber}
      />
    </>
  );
} 