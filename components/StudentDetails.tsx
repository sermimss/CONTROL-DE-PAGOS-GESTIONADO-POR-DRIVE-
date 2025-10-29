import React from 'react';
import { Student, StudentStatus } from '../types';
import { EditIcon } from './icons/EditIcon';

interface StudentDetailsProps {
  student: Student;
  onEdit: (student: Student) => void;
}

const DetailItem: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">{value}</dd>
    </div>
);

const StudentDetails: React.FC<StudentDetailsProps> = ({ student, onEdit }) => {
  const { nombre, apellidoPaterno, apellidoMaterno, status, curp, studyPlan, enrollmentDate, courseStartDate, fechaNacimiento, calle, numero, colonia, telefono } = student;
  
  const statusBadge = (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        status === StudentStatus.Active 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
    }`}>
      {status}
    </span>
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    // Agregamos un día para corregir el desfase de zona horaria en la visualización
    const dateObj = new Date(dateString);
    dateObj.setDate(dateObj.getDate() + 1);
    return dateObj.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const fullAddress = calle && numero && colonia ? `${calle} ${numero}, ${colonia}` : 'No especificada';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detalles del Alumno
            </h2>
            <button
                onClick={() => onEdit(student)}
                className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900"
                aria-label="Editar alumno"
            >
                <EditIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="p-4 sm:p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre Completo</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-white font-bold">{`${nombre} ${apellidoPaterno} ${apellidoMaterno}`}</dd>
                </div>
                <DetailItem label="CURP" value={curp} />
                <DetailItem label="Estado" value={statusBadge} />
                <DetailItem label="Fecha de Nacimiento" value={formatDate(fechaNacimiento)} />
                <DetailItem label="Número Celular" value={telefono || 'No especificado'} />
                <div className="sm:col-span-2">
                    <DetailItem label="Dirección" value={fullAddress} />
                </div>
                <div className="sm:col-span-2">
                    <DetailItem label="Plan de Estudios" value={studyPlan || 'No especificado'} />
                </div>
                <DetailItem label="Fecha de Inscripción" value={formatDate(enrollmentDate)} />
                <DetailItem label="Inicio de Curso" value={formatDate(courseStartDate)} />
            </dl>
        </div>
    </div>
  );
};

export default StudentDetails;