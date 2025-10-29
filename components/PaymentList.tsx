
import React from 'react';
import { Payment } from '../types';
import PaymentItem from './PaymentItem';
import { PlusIcon } from './icons/PlusIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface PaymentListProps {
  payments: Payment[];
  studentName?: string;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onExportStudentPayments: () => void;
}

const PaymentList: React.FC<PaymentListProps> = ({ payments, studentName, onEdit, onDelete, onAdd, onExportStudentPayments }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center gap-2 flex-wrap">
        <h2 className="text-xl font-semibold">
          {studentName ? `Pagos de ${studentName}` : 'Historial de Pagos'}
        </h2>
        {studentName && (
            <div className="flex items-center space-x-2">
                <button
                    onClick={onExportStudentPayments}
                    title="Exportar historial del alumno a CSV"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <DownloadIcon className="w-5 h-5 sm:mr-2 -ml-1 sm:ml-0" />
                    <span className="hidden sm:inline">Exportar Historial (CSV)</span>
                </button>
                <button
                    onClick={onAdd}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                    Añadir Pago
                </button>
            </div>
        )}
      </div>
      
      {payments.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p>Este alumno no tiene pagos registrados.</p>
          <p className="text-sm">¡Añade su primer pago!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Tabla para Escritorio */}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden md:table">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {payments.map(payment => (
                <PaymentItem key={payment.id} payment={payment} onEdit={onEdit} onDelete={onDelete} isCardView={false} />
              ))}
            </tbody>
          </table>
          {/* Tarjetas para Móvil */}
          <div className="md:hidden">
              {payments.map(payment => (
                  <PaymentItem key={payment.id} payment={payment} onEdit={onEdit} onDelete={onDelete} isCardView={true} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentList;