import React from 'react';
import { Student } from '../types';
import { STUDY_PLAN_CONFIG, generatePaymentSchedule } from '../utils/paymentPlans';

interface PaymentChecklistProps {
  student: Student;
}

const formatShortDate = (date: Date): string => {
    const currentYear = new Date().getFullYear();
    const dateYear = date.getFullYear();

    const day = date.getDate();
    // 'es-MX' da 'abr.', lo capitalizamos y limpiamos.
    let month = new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(date);
    month = month.charAt(0).toUpperCase() + month.slice(1).replace('.', '');

    if (dateYear !== currentYear) {
        const year = date.getFullYear().toString().slice(-2);
        return `${day} ${month} '${year}`;
    } else {
        return `${day} ${month}`;
    }
};

const ChecklistItem: React.FC<{ 
    label: string; 
    checked: boolean; 
    dueDate?: string; 
    isOverdue?: boolean; 
    isReEnrollment?: boolean;
}> = ({ label, checked, dueDate, isOverdue, isReEnrollment }) => {
    
    const reEnrollmentClasses = isReEnrollment
        ? "border-2 border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-semibold"
        // Si no es reinscripción pero está pagado, aplica un estilo sutil
        : checked 
            ? "border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40"
            : "border border-gray-200 dark:border-gray-700";

    return (
        <div className={`flex items-center justify-between w-full p-2 rounded-md transition-all ${reEnrollmentClasses}`}>
            <div className="flex items-center space-x-2 min-w-0">
                <input 
                    type="checkbox" 
                    checked={checked} 
                    readOnly
                    disabled
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0 disabled:opacity-100"
                />
                <span className={`text-sm truncate ${checked ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`} title={label}>{label}</span>
            </div>
            {dueDate && <span className={`text-xs font-mono flex-shrink-0 ml-2 ${isOverdue && !checked ? 'text-red-500 dark:text-red-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>{dueDate}</span>}
        </div>
    );
};

const PaymentChecklist: React.FC<PaymentChecklistProps> = ({ student }) => {
  const { paymentPlanStatus, studyPlan, courseStartDate } = student;
  const config = STUDY_PLAN_CONFIG[studyPlan];

  if (!paymentPlanStatus || !config) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center text-gray-500">
            Este plan de estudios no tiene un checklist de pagos configurado.
        </div>
    );
  }

  if (!courseStartDate) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center text-gray-500">
            Por favor, establece una fecha de inicio de curso para ver el checklist de pagos.
        </div>
    );
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const schedule = generatePaymentSchedule(courseStartDate, studyPlan);

  const enrollmentDueDateObj = new Date(courseStartDate);
  enrollmentDueDateObj.setMinutes(enrollmentDueDateObj.getMinutes() + enrollmentDueDateObj.getTimezoneOffset());
  const isEnrollmentOverdue = !paymentPlanStatus.enrollment && enrollmentDueDateObj < today;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold">Checklist de Pagos del Plan</h3>
      </div>
      <div className="p-4 sm:p-6 space-y-6">
        <div>
            <h4 className="font-semibold text-md mb-2">Inscripción</h4>
            <div className="max-w-xs">
                <ChecklistItem 
                    label="Pago de Inscripción"
                    checked={paymentPlanStatus.enrollment}
                    dueDate={formatShortDate(enrollmentDueDateObj)}
                    isOverdue={isEnrollmentOverdue}
                />
            </div>
        </div>
        
        {schedule.length > 0 && (
            <div>
                <h4 className="font-semibold text-md mb-2 flex justify-between items-center">
                    <span>{config.feeType === 'Mensualidad' ? 'Cuotas y Reinscripciones' : 'Cuotas y Reinscripciones'}</span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        Pagado: {paymentPlanStatus.schedule.filter(Boolean).length} de {schedule.length}
                    </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {schedule.map((item, index) => (
                        <ChecklistItem 
                            key={index}
                            label={item.label}
                            checked={paymentPlanStatus.schedule[index]}
                            dueDate={formatShortDate(item.dueDate)}
                            isOverdue={item.dueDate < today && !paymentPlanStatus.schedule[index]}
                            isReEnrollment={item.isReEnrollment}
                        />
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PaymentChecklist;