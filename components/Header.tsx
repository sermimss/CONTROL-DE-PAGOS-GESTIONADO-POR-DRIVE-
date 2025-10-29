import React, { useState } from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { StudyPlan, StudyPlanFilter } from '../types';
import { GoogleDriveUser } from '../services/googleDrive';
import { SyncStatus } from '../hooks/useGoogleDrive';

interface HeaderProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    currentStudyPlanFilter: StudyPlanFilter;
    onStudyPlanFilterChange: (filter: StudyPlanFilter) => void;
    user: GoogleDriveUser | null;
    onSignOut: () => void;
    syncStatus: SyncStatus;
}

const SyncIndicator: React.FC<{ status: SyncStatus }> = ({ status }) => {
    const statusMap = {
        idle: { text: 'Inactivo', color: 'gray' },
        syncing: { text: 'Guardando...', color: 'blue' },
        synced: { text: 'Sincronizado', color: 'green' },
        error: { text: 'Error', color: 'red' },
    };
    const { text, color } = statusMap[status];
    
    return (
        <div className="flex items-center space-x-2">
            <span className={`h-2 w-2 rounded-full bg-${color}-500`}></span>
            <span className={`text-xs text-${color}-600 dark:text-${color}-400`}>{text}</span>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, currentStudyPlanFilter, onStudyPlanFilterChange, user, onSignOut, syncStatus }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Control de Pagos
            </h1>
            <div className="hidden md:block">
                <label htmlFor="studyPlanFilter" className="sr-only">Filtrar por Plan de Estudio</label>
                 <select
                    id="studyPlanFilter"
                    value={currentStudyPlanFilter}
                    onChange={(e) => onStudyPlanFilterChange(e.target.value as StudyPlanFilter)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="Todos">Todos los Planes</option>
                    {Object.values(StudyPlan).map(plan => (
                        <option key={plan} value={plan}>{plan}</option>
                    ))}
                </select>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onToggleTheme}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
            {user && (
                 <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-full">
                        <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                        <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
                        <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:inline transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                </div>
                                <div className="px-4 py-2">
                                     <SyncIndicator status={syncStatus} />
                                </div>
                                <button
                                    onClick={() => { onSignOut(); setIsMenuOpen(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;