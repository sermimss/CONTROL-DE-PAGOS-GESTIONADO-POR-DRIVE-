import React, { useState, useEffect } from 'react';
import { Student, StudentStatus, StudyPlan } from '../types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id' | 'paymentPlanStatus'>) => void;
  student: Student | null;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSave, student }) => {
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [colonia, setColonia] = useState('');
  const [telefono, setTelefono] = useState('');
  const [status, setStatus] = useState<StudentStatus>(StudentStatus.Active);
  const [curp, setCurp] = useState('');
  const [studyPlan, setStudyPlan] = useState<StudyPlan>(StudyPlan.GeneralNursing);
  const [enrollmentDate, setEnrollmentDate] = useState('');
  const [courseStartDate, setCourseStartDate] = useState('');


  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (student) {
      setNombre(student.nombre);
      setApellidoPaterno(student.apellidoPaterno);
      setApellidoMaterno(student.apellidoMaterno);
      setFechaNacimiento(student.fechaNacimiento);
      setCalle(student.calle || '');
      setNumero(student.numero || '');
      setColonia(student.colonia || '');
      setTelefono(student.telefono || '');
      setStatus(student.status);
      setCurp(student.curp || '');
      setStudyPlan(student.studyPlan || StudyPlan.GeneralNursing);
      setEnrollmentDate(student.enrollmentDate || today);
      setCourseStartDate(student.courseStartDate || today);
    } else {
      setNombre('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      setFechaNacimiento('');
      setCalle('');
      setNumero('');
      setColonia('');
      setTelefono('');
      setStatus(StudentStatus.Active);
      setCurp('');
      setStudyPlan(StudyPlan.GeneralNursing);
      setEnrollmentDate(today);
      setCourseStartDate(today);
    }
  }, [student, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellidoPaterno.trim() || !apellidoMaterno.trim()) {
      alert('Por favor, introduce el nombre completo del alumno.');
      return;
    }
     if (!curp.trim() || curp.trim().length !== 18) {
      alert('Por favor, introduce una CURP válida de 18 caracteres.');
      return;
    }
    onSave({ nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, calle, numero, colonia, telefono, status, curp, studyPlan, enrollmentDate, courseStartDate });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{student ? 'Editar Alumno' : 'Añadir Nuevo Alumno'}</h2>
          <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto pr-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre(s)</label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                  placeholder="Ej. Juan"
                />
              </div>
               <div>
                <label htmlFor="apellidoPaterno" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido Paterno</label>
                <input
                  type="text"
                  id="apellidoPaterno"
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                  placeholder="Ej. Pérez"
                />
              </div>
               <div>
                <label htmlFor="apellidoMaterno" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido Materno</label>
                <input
                  type="text"
                  id="apellidoMaterno"
                  value={apellidoMaterno}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                  placeholder="Ej. García"
                />
              </div>
              <div>
                <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Nacimiento</label>
                <input
                  type="date"
                  id="fechaNacimiento"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="calle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Calle</label>
                <input
                  type="text"
                  id="calle"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                  placeholder="Ej. Av. Siempre Viva"
                />
              </div>
              <div>
                <label htmlFor="numero" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número</label>
                <input
                  type="text"
                  id="numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                  placeholder="Ej. 123"
                />
              </div>
               <div>
                <label htmlFor="colonia" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Colonia</label>
                <input
                  type="text"
                  id="colonia"
                  value={colonia}
                  onChange={(e) => setColonia(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                  placeholder="Ej. Springfield"
                />
              </div>
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número Celular</label>
                <input
                  type="tel"
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                  placeholder="Ej. 55 1234 5678"
                />
              </div>
              <div>
                <label htmlFor="curp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CURP</label>
                <input
                  type="text"
                  id="curp"
                  value={curp}
                  onChange={(e) => setCurp(e.target.value.toUpperCase())}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                  placeholder="Clave Única de Registro de Población"
                  maxLength={18}
                  minLength={18}
                />
              </div>
              <div>
                <label htmlFor="enrollmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Inscripción</label>
                <input
                  type="date"
                  id="enrollmentDate"
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="courseStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Inicio de Curso</label>
                <input
                  type="date"
                  id="courseStartDate"
                  value={courseStartDate}
                  onChange={(e) => setCourseStartDate(e.target.value)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="studyPlan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plan de Estudios</label>
                <select
                  id="studyPlan"
                  value={studyPlan}
                  onChange={(e) => setStudyPlan(e.target.value as StudyPlan)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                >
                  {Object.values(StudyPlan).map(plan => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StudentStatus)}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                >
                  {Object.values(StudentStatus).map(stat => (
                    <option key={stat} value={stat}>{stat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Guardar Alumno
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentFormModal;