import { StudyPlan, PaymentPlanStatus } from '../types';

type FeeType = 'Mensualidad' | 'Semanalidad';

interface PlanConfig {
  reEnrollments: number;
  fees: number;
  feeType: FeeType;
  prices: {
    enrollment: number;
    reEnrollment: number;
    fee: number;
  };
  reEnrollmentSchedule: number[]; // Array of 0-based indices (month or week)
}

export interface PaymentScheduleItem {
  label: string;
  dueDate: Date;
  isReEnrollment: boolean; // True si es una reinscripción o un pago combinado
  cost: number;
}

export const STUDY_PLAN_CONFIG: Record<StudyPlan, PlanConfig> = {
  [StudyPlan.GeneralNursing]: { 
    reEnrollments: 8, 
    fees: 36, 
    feeType: 'Mensualidad',
    prices: { enrollment: 1900, reEnrollment: 1900, fee: 1900 },
    reEnrollmentSchedule: [4, 8, 12, 16, 20, 24, 28, 32], // Meses 5, 9, 13, 17, 21, 25, 29, 33
  },
  [StudyPlan.LevelingDegree]: { 
    reEnrollments: 2, 
    fees: 12, 
    feeType: 'Mensualidad',
    prices: { enrollment: 2200, reEnrollment: 2200, fee: 2200 },
    reEnrollmentSchedule: [4, 8], // Meses 5 y 9
  },
  [StudyPlan.Podiatry]: { 
    reEnrollments: 0, 
    fees: 27, 
    feeType: 'Semanalidad',
    prices: { enrollment: 900, reEnrollment: 0, fee: 250 },
    reEnrollmentSchedule: [],
  },
  [StudyPlan.NursingAssistant]: { 
    reEnrollments: 1, 
    fees: 54, 
    feeType: 'Semanalidad',
    prices: { enrollment: 900, reEnrollment: 900, fee: 250 },
    reEnrollmentSchedule: [27], // Semana 28
  },
  [StudyPlan.PrehospitalCare]: { 
    reEnrollments: 1, 
    fees: 54, 
    feeType: 'Semanalidad',
    prices: { enrollment: 900, reEnrollment: 900, fee: 250 },
    reEnrollmentSchedule: [27], // Semana 28
  },
  [StudyPlan.SurgicalNursing]: { 
    reEnrollments: 0, 
    fees: 27, 
    feeType: 'Semanalidad',
    prices: { enrollment: 900, reEnrollment: 0, fee: 250 },
    reEnrollmentSchedule: [],
  },
  [StudyPlan.IndustrialNursing]: { 
    reEnrollments: 0, 
    fees: 27, 
    feeType: 'Semanalidad',
    prices: { enrollment: 900, reEnrollment: 0, fee: 250 },
    reEnrollmentSchedule: [],
  },
};

export const generatePaymentSchedule = (
  courseStartDate: string,
  studyPlan: StudyPlan
): PaymentScheduleItem[] => {
  if (!courseStartDate) return [];

  const config = STUDY_PLAN_CONFIG[studyPlan];
  const schedule: PaymentScheduleItem[] = [];
  const reEnrollmentScheduleSet = new Set(config.reEnrollmentSchedule);
  let reEnrollmentCounter = 0;

  for (let i = 0; i < config.fees; i++) {
    const dueDate = calculateDueDate(courseStartDate, studyPlan, 'fee', i);
    const isReEnrollmentDate = reEnrollmentScheduleSet.has(i);

    if (isReEnrollmentDate) {
      reEnrollmentCounter++;
      schedule.push({
        label: `${config.feeType} ${i + 1} / Reinscripción ${reEnrollmentCounter}`,
        dueDate,
        isReEnrollment: true,
        cost: config.prices.fee + config.prices.reEnrollment,
      });
    } else {
      schedule.push({
        label: `${config.feeType} ${i + 1}`,
        dueDate,
        isReEnrollment: false,
        cost: config.prices.fee,
      });
    }
  }

  return schedule;
};


export const getInitialPaymentPlanStatus = (studyPlan: StudyPlan): PaymentPlanStatus => {
  // Se necesita una fecha de inicio falsa para generar el cronograma y obtener su longitud.
  // Las fechas reales no importan aquí, solo el número de conceptos.
  const dummyStartDate = '2024-01-01'; 
  const schedule = generatePaymentSchedule(dummyStartDate, studyPlan);

  return {
    enrollment: false,
    schedule: Array(schedule.length).fill(false),
  };
};

/**
 * Calcula la fecha de vencimiento para un concepto de pago específico.
 * @param courseStartDate - La fecha de inicio del curso del alumno (YYYY-MM-DD).
 * @param studyPlan - El plan de estudios del alumno.
 * @param itemType - El tipo de concepto ('enrollment', 'fee').
 * @param index - El índice del concepto (ej. para la cuota 3, el índice es 2).
 * @returns Un objeto Date con la fecha de vencimiento calculada.
 */
export const calculateDueDate = (
  courseStartDate: string,
  studyPlan: StudyPlan,
  itemType: 'enrollment' | 'fee',
  index: number = 0
): Date => {
  const config = STUDY_PLAN_CONFIG[studyPlan];

  // Corrige el desfase de zona horaria al crear la fecha desde un string YYYY-MM-DD
  const baseDate = new Date(courseStartDate);
  baseDate.setMinutes(baseDate.getMinutes() + baseDate.getTimezoneOffset());
  
  const dueDate = new Date(baseDate);

  switch (itemType) {
    case 'enrollment':
      // La fecha de vencimiento es la fecha de inicio del curso
      return dueDate;
    
    case 'fee':
      if (config.feeType === 'Mensualidad') {
        dueDate.setMonth(dueDate.getMonth() + index);
      } else { // Semanalidad
        dueDate.setDate(dueDate.getDate() + (index * 7));
      }
      return dueDate;

    default:
      return dueDate;
  }
};