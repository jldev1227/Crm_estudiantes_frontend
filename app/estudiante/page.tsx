"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckSquare, ChevronRight } from 'lucide-react';
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EstudiantePage() {
  const router = useRouter();

  const navigateToMaterias = () => {
    router.push("/estudiante/materias");
  };

  const navigateToActividades = () => {
    router.push("/estudiante/actividades");
  };

  return (
    <ProtectedRoute>
      <div className="bg-white flex flex-col items-center p-4">
        <div className="max-w-4xl w-full text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Bienvenido, Estudiante
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Consulta las actividades realizadas por área y gestiona tu progreso académico
          </p>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Card de Materias Asignadas */}
          <div 
            onClick={navigateToMaterias}
            className="bg-primary-500 text-white rounded-2xl px-5 py-8 sm:p-8 shadow-lg flex flex-col sm:flex-row items-center sm:space-x-6 gap-5 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <BookOpen size={48} className="text-white" />
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold mb-2">Materias Asignadas</h2>
              <p className="text-white text-opacity-80">
                Explora tus materias y contenidos
              </p>
            </div>
            <ChevronRight size={32} className="text-white" />
          </div>

          {/* Card de Actividades */}
          <div 
            onClick={navigateToActividades}
            className="bg-gray-100 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center sm:space-x-6 gap-5 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="bg-primary-500 bg-opacity-20 rounded-full p-4">
              <CheckSquare size={48} className="text-primary-500" />
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Mis Actividades</h2>
              <p className="text-gray-600">
                Consulta y realiza tus tareas
              </p>
            </div>
            <ChevronRight size={32} className="text-gray-500" />
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <BookOpen size={20} />
            <span>Progreso Académico</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <CheckSquare size={20} />
            <span>Seguimiento de Tareas</span>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}