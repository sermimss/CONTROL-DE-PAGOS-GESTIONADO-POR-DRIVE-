export enum PaymentStatus {
  Paid = 'Pagado',
  Pending = 'Pendiente',
}

export enum PaymentCategory {
  Enrollment = 'Inscripción',
  ReEnrollment = 'Reinscripción',
  MonthlyFee = 'Mensualidad',
  WeeklyFee = 'Semanalidad',
  Balance = 'Saldo a favor',
  Materials = 'Materiales',
  Exam = 'Examen',
  Other = 'Otros',
}

export enum StudentStatus {
    Active = 'Activo',
    Inactive = 'Inactivo',
}

export type StudentStatusFilter = StudentStatus | 'Todos';
export type StudyPlanFilter = StudyPlan | 'Todos';

export enum StudyPlan {
  LevelingDegree = 'Licenciatura por Nivelación',
  GeneralNursing = 'Enfermería General',
  Podiatry = 'Podología',
  PrehospitalCare = 'Atención Médica Prehospitalaria',
  NursingAssistant = 'Auxiliar de Enfermería',
  SurgicalNursing = 'Enfermería Quirúrgica',
  IndustrialNursing = 'Enfermería Industrial',
}

export interface PaymentPlanStatus {
  enrollment: boolean;
  schedule: boolean[];
}

export interface Student {
    id: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string;
    calle: string;
    numero: string;
    colonia: string;
    telefono: string;
    status: StudentStatus;
    curp: string;
    studyPlan: StudyPlan;
    paymentPlanStatus: PaymentPlanStatus;
    enrollmentDate: string;
    courseStartDate: string;
}

export interface Payment {
  id: string;
  studentId: string; // Enlace al alumno
  description: string;
  amount: number;
  date: string; // Formato de fecha ISO
  category: PaymentCategory;
  status: PaymentStatus;
}