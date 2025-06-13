import { Fragment } from 'react';
import { Dialog } from '@headlessui/react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
}

export default function SuccessModal({ isOpen, onClose, tableNumber }: SuccessModalProps) {
  return (
    <Dialog as="div" className="relative z-50" onClose={onClose} open={isOpen}>
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex flex-col items-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <Dialog.Title
                as="h3"
                className="mt-4 text-xl font-semibold leading-6 text-gray-900"
              >
                Заказ успешно создан
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Заказ для столика {tableNumber} был успешно создан и добавлен в систему.
                </p>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={onClose}
                >
                  Понятно
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
} 