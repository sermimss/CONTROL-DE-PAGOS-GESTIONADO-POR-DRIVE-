import React from 'react';
import { Student, StudentStatus, StudentStatusFilter } from '../types';
import { UserPlusIcon } from './icons/UserPlusIcon';

interface StudentListProps {
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
  onAddStudent: () => void;
  currentFilter: StudentStatusFilter;
  onFilterChange: (filter: StudentStatusFilter) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, selectedStudentId, onSelectStudent, onAddStudent, currentFilter, onFilterChange }) => {
  
  const filterOptions: { label: string; value: StudentStatusFilter }[] = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Activos', value: StudentStatus.Active },
    { label: 'Inactivos', value: StudentStatus.Inactive },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Alumnos</h2>
            <button
                onClick={onAddStudent}
                title="Añadir nuevo alumno"
                className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <UserPlusIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="mt-4 flex items-center border border-gray-200 dark:border-gray-600 rounded-lg p-1 w-full sm:w-auto bg-gray-50 dark:bg-gray-700/50">
            {filterOptions.map(({ label, value }) => (
                <button
                    key={value}
                    onClick={() => onFilterChange(value)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                        currentFilter === value
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
      </div>
      <div className="overflow-y-auto flex-grow">
        {students.length === 0 ? (
          <div className="text-center p-8 text-gray-500 h-full flex flex-col justify-center">
            <p>No hay alumnos que coincidan con el filtro.</p>
            <p className="text-sm">Intenta seleccionar otro filtro.</p>
          </div>
        ) : (
          <ul>
            {students.map(student => (
              <li key={student.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <button
                  onClick={() => onSelectStudent(student.id)}
                  className={`w-full text-left p-4 transition-colors duration-150 ${
                    selectedStudentId === student.id 
                    ? 'bg-indigo-50 dark:bg-indigo-900/50' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className={`font-medium ${selectedStudentId === student.id ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>{`${student.apellidoPaterno} ${student.apellidoMaterno}, ${student.nombre}`}</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.status === StudentStatus.Active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                        {student.status}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentList;