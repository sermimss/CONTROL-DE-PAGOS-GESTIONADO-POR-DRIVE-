
import React, { useState, useMemo, useEffect } from 'react';
// FIX: Import PaymentCategory to use enum values instead of strings.
import { Payment, Student, StudyPlanFilter, StudentStatusFilter, PaymentCategory } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PaymentList from './components/PaymentList';
import PaymentFormModal from './components/PaymentFormModal';
import StudentList from './components/StudentList';
import StudentFormModal from './components/StudentFormModal';
import StudentDetails from './components/StudentDetails';
import PaymentChecklist from './components/PaymentChecklist';
import { getInitialPaymentPlanStatus, STUDY_PLAN_CONFIG, generatePaymentSchedule } from './utils/paymentPlans';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import ConnectScreen from './components/ConnectScreen';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const { 
    students, setStudents, 
    payments, setPayments, 
    isInitialized, isSignedIn, user, 
    handleSignIn, handleSignOut, 
    isLoading, syncStatus 
  } = useGoogleDrive();
  
  // Estado para el control de la UI
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isStudentModalOpen, setStudentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentStatusFilter, setStudentStatusFilter] = useState<StudentStatusFilter>('Todos');
  const [studyPlanFilter, setStudyPlanFilter] = useState<StudyPlanFilter>('Todos');
  
  // Estado para el modo oscuro
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(
    'theme',
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // CRUD de Alumnos
  const addStudent = (studentData: Omit<Student, 'id' | 'paymentPlanStatus'>) => {
    const newStudent: Student = { 
      ...studentData, 
      id: new Date().getTime().toString(),
      paymentPlanStatus: getInitialPaymentPlanStatus(studentData.studyPlan) 
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(
      prev => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
  };

  const handleStudentSave = (studentData: Omit<Student, 'id' | 'paymentPlanStatus'>) => {
    if (editingStudent) {
      const studentToUpdate = students.find(s => s.id === editingStudent.id);
      if (studentToUpdate) {
        let updatedStudent: Student = { 
          ...studentToUpdate, 
          ...studentData 
        };

        if (studentToUpdate.studyPlan !== studentData.studyPlan) {
          if (window.confirm('Cambiar el plan de estudios reiniciará el checklist de pagos. ¿Desea continuar?')) {
            updatedStudent.paymentPlanStatus = getInitialPaymentPlanStatus(studentData.studyPlan);
          } else {
            updatedStudent.studyPlan = studentToUpdate.studyPlan;
          }
        }
        updateStudent(updatedStudent);
      }
    } else {
      addStudent(studentData);
    }
    closeStudentModal();
  };

  // CRUD de Pagos
  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...payment, id: new Date().getTime().toString() };
    setPayments(prevPayments => [...prevPayments, newPayment]);
  };

  const updatePayment = (updatedPayment: Payment) => {
    setPayments(
      prev => prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
    );
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter((p) => p.id !== id));
  };
  
  const handlePaymentSave = (paymentData: Omit<Payment, 'id'>) => {
    const student = students.find(s => s.id === paymentData.studentId);
    if (!student) {
        alert("El alumno seleccionado no existe.");
        return;
    }
    
    // Si se está editando un pago pendiente y se cambia a pagado, se eliminará el original
    const isEditingAndStatusChangedToPaid = editingPayment && editingPayment.status !== 'Pagado' && paymentData.status === 'Pagado';
    
    // Lógica para aplicar el pago al checklist si se marca como "Pagado"
    if (paymentData.status === 'Pagado') {
        if (!student.courseStartDate) {
            alert("El alumno seleccionado no tiene una fecha de inicio de curso configurada.");
            closePaymentModal();
            return;
        }

        const planConfig = STUDY_PLAN_CONFIG[student.studyPlan];
        if (!planConfig || !planConfig.prices) {
            closePaymentModal();
            return;
        }
        
        let remainingAmount = paymentData.amount;
        const newPayments: Omit<Payment, 'id'>[] = [];
        const newStatus = JSON.parse(JSON.stringify(student.paymentPlanStatus));

        // 1. Pagar Inscripción
        if (!newStatus.enrollment && remainingAmount >= planConfig.prices.enrollment) {
            // FIX: Use PaymentCategory enum instead of string literal.
            newPayments.push({ ...paymentData, description: 'Pago de Inscripción', amount: planConfig.prices.enrollment, category: PaymentCategory.Enrollment });
            remainingAmount -= planConfig.prices.enrollment;
            newStatus.enrollment = true;
        }
        
        // 2. Pagar Cuotas del Plan
        const schedule = generatePaymentSchedule(student.courseStartDate, student.studyPlan);
        for (let i = 0; i < schedule.length; i++) {
            if (remainingAmount <= 0) break;
            if (!newStatus.schedule[i]) {
                const itemToPay = schedule[i];
                if (remainingAmount >= itemToPay.cost) {
                    // FIX: Use PaymentCategory enum members instead of string literals.
                    newPayments.push({ ...paymentData, description: `Pago de ${itemToPay.label}`, amount: itemToPay.cost, category: itemToPay.isReEnrollment ? PaymentCategory.ReEnrollment : (planConfig.feeType === 'Mensualidad' ? PaymentCategory.MonthlyFee : PaymentCategory.WeeklyFee) });
                    remainingAmount -= itemToPay.cost;
                    newStatus.schedule[i] = true;
                }
            }
        }

        // 3. Registrar Saldo a Favor
        if (remainingAmount > 0) {
             // FIX: Use PaymentCategory enum instead of string literal.
             newPayments.push({ ...paymentData, description: 'Saldo a favor', amount: remainingAmount, category: PaymentCategory.Balance });
        }
        
        if(newPayments.length === 0) {
            alert(`El monto de ${paymentData.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} no es suficiente para cubrir el siguiente pago pendiente.`);
            return;
        }

        if (isEditingAndStatusChangedToPaid && editingPayment) {
            setPayments(prev => prev.filter(p => p.id !== editingPayment.id));
        }

        newPayments.forEach(p => addPayment(p));
        updateStudent({ ...student, paymentPlanStatus: newStatus });

    } else { // Si el pago es "Pendiente" o se está editando sin cambiar a "Pagado"
      if (editingPayment && !isEditingAndStatusChangedToPaid) {
        updatePayment({ ...paymentData, id: editingPayment.id });
      } else {
        addPayment(paymentData);
      }
    }
    closePaymentModal();
  };

  // Manejadores de modales para Alumnos y Pagos...
  const openAddStudentModal = () => { setEditingStudent(null); setStudentModalOpen(true); };
  const openEditStudentModal = (student: Student) => { setEditingStudent(student); setStudentModalOpen(true); };
  const closeStudentModal = () => { setStudentModalOpen(false); setEditingStudent(null); };
  const openAddPaymentModal = () => { setEditingPayment(null); setPaymentModalOpen(true); };
  const openEditPaymentModal = (payment: Payment) => { setEditingPayment(payment); setPaymentModalOpen(true); };
  const closePaymentModal = () => { setPaymentModalOpen(false); setEditingPayment(null); };
  const handleSelectStudent = (id: string | null) => setSelectedStudentId(id);
  
  // Exportar pagos del alumno seleccionado
  const handleExportStudentPayments = () => {
    if (!selectedStudent || paymentsForSelectedStudent.length === 0) {
      alert("No hay pagos para exportar para este alumno.");
      return;
    }

    const headers = ['ID Pago', 'Descripción', 'Monto', 'Fecha', 'Categoría', 'Estado'];
    const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;
    const csvRows = [headers.join(',')];

    paymentsForSelectedStudent.forEach(p => {
      const row = [p.id, escapeCSV(p.description), p.amount, p.date, p.category, p.status];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const studentNameSafe = `${selectedStudent.nombre}_${selectedStudent.apellidoPaterno}`.replace(/\s/g, '_');
    link.setAttribute("download", `historial_pagos_${studentNameSafe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Estado derivado y memorizado
  const filteredStudentsByPlan = useMemo(() => {
    if (studyPlanFilter === 'Todos') return students;
    return students.filter(s => s.studyPlan === studyPlanFilter);
  }, [students, studyPlanFilter]);

  const filteredPayments = useMemo(() => {
    if (studyPlanFilter === 'Todos') return payments;
    const filteredStudentIds = new Set(filteredStudentsByPlan.map(s => s.id));
    return payments.filter(p => filteredStudentIds.has(p.studentId));
  }, [payments, filteredStudentsByPlan]);
  
  useEffect(() => {
    if (selectedStudentId && !filteredStudentsByPlan.some(s => s.id === selectedStudentId)) {
      setSelectedStudentId(null);
    }
  }, [filteredStudentsByPlan, selectedStudentId]);
  
  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  const paymentsForSelectedStudent = useMemo(() => {
    if (!selectedStudentId) return [];
    return payments
      .filter(p => p.studentId === selectedStudentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, selectedStudentId]);
  
  const sortedStudents = useMemo(() => {
    const filtered = filteredStudentsByPlan.filter(student => studentStatusFilter === 'Todos' || student.status === studentStatusFilter);
    return [...filtered].sort((a, b) => `${a.apellidoPaterno} ${a.apellidoMaterno} ${a.nombre}`.localeCompare(`${b.apellidoPaterno} ${b.apellidoMaterno} ${b.nombre}`));
  }, [filteredStudentsByPlan, studentStatusFilter]);

  // Renderizado condicional basado en el estado de autenticación
  if (!isInitialized || (isSignedIn && isLoading)) {
    return <LoadingSpinner text={!isInitialized ? "Inicializando..." : "Cargando datos..."} />;
  }

  if (!isSignedIn) {
    return <ConnectScreen onSignIn={handleSignIn} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header 
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentStudyPlanFilter={studyPlanFilter}
        onStudyPlanFilterChange={setStudyPlanFilter}
        user={user}
        onSignOut={handleSignOut}
        syncStatus={syncStatus}
      />
     
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Dashboard 
          payments={filteredPayments} 
          students={filteredStudentsByPlan} 
          studyPlanFilter={studyPlanFilter}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <StudentList 
              students={sortedStudents}
              selectedStudentId={selectedStudentId}
              onSelectStudent={handleSelectStudent}
              onAddStudent={openAddStudentModal}
              currentFilter={studentStatusFilter}
              onFilterChange={setStudentStatusFilter}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            {selectedStudent ? (
              <>
                <StudentDetails student={selectedStudent} onEdit={() => openEditStudentModal(selectedStudent)} />
                <PaymentChecklist student={selectedStudent} />
                <PaymentList 
                  payments={paymentsForSelectedStudent} 
                  studentName={`${selectedStudent.nombre} ${selectedStudent.apellidoPaterno}`}
                  onEdit={openEditPaymentModal} 
                  onDelete={deletePayment}
                  onAdd={openAddPaymentModal}
                  onExportStudentPayments={handleExportStudentPayments}
                />
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md h-full flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Selecciona o Crea un Alumno</h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                  Elige un alumno de la lista para ver sus detalles y pagos, o añade uno nuevo para empezar a gestionar su información.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {isStudentModalOpen && (
        <StudentFormModal 
          isOpen={isStudentModalOpen}
          onClose={closeStudentModal}
          onSave={handleStudentSave}
          student={editingStudent}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentFormModal
          isOpen={isPaymentModalOpen}
          onClose={closePaymentModal}
          onSave={handlePaymentSave}
          payment={editingPayment}
          students={students}
          selectedStudentId={selectedStudentId}
        />
      )}
    </div>
  );
};

export default App;
