"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckSquare,
  ChevronRight,
  Clock,
  Award,
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function EstudiantePage() {
  const router = useRouter();

  const navigateToMaterias = () => {
    router.push("/estudiante/materias");
  };

  const navigateToActividades = () => {
    router.push("/estudiante/actividades");
  };

  const navigateToTareasPendientes = () => {
    router.push("/estudiante/tareas");
  };

  const navigateToCalificaciones = () => {
    router.push("/estudiante/calificaciones");
  };

  return (
    <ProtectedRoute>
      <div className="bg-white flex flex-col items-center p-4">
        <div className="max-w-4xl w-full text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Bienvenido, Estudiante
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Consulta las actividades realizadas por área y gestiona tu progreso
            académico
          </p>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Card de Materias Asignadas */}
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl px-5 py-8 sm:p-8 shadow-lg flex flex-col sm:flex-row items-center sm:space-x-6 gap-5 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            role="button"
            onClick={navigateToMaterias}
          >
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <BookOpen className="text-white" size={48} />
            </div>
            <div className="flex-grow text-center">
              <h2 className="text-2xl font-bold mb-2">Materias Asignadas</h2>
              <p className="text-white text-opacity-80">
                Explora tus materias y contenidos
              </p>
            </div>
            <ChevronRight className="text-white" size={32} />
          </div>

          {/* Card de Actividades */}
          <div
            className="bg-gray-100 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center sm:space-x-6 gap-5 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            role="button"
            onClick={navigateToActividades}
          >
            <div className="bg-gray-500 bg-opacity-20 rounded-full p-4">
              <CheckSquare className="text-gray-500" size={48} />
            </div>
            <div className="flex-grow text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Actividades
              </h2>
              <p className="text-gray-600">
                Consulta y realiza tus actvidiades diarias
              </p>
            </div>
            <ChevronRight className="text-gray-500" size={32} />
          </div>

          {/* Card de Tareas Pendientes */}
          <div
            className="bg-amber-50 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center sm:space-x-6 gap-5 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            role="button"
            onClick={navigateToTareasPendientes}
          >
            <div className="bg-amber-500 bg-opacity-20 rounded-full p-4">
              <Clock className="text-amber-600" size={48} />
            </div>
            <div className="flex-grow text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Tareas Pendientes
              </h2>
              <p className="text-gray-600">
                Revisa y organiza tus entregas próximas
              </p>
            </div>
            <ChevronRight className="text-gray-500" size={32} />
          </div>

          {/* Card de Calificaciones */}
          <div
            className="bg-green-50 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center sm:space-x-6 gap-5 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            role="button"
            onClick={navigateToCalificaciones}
          >
            <div className="bg-green-500 bg-opacity-20 rounded-full p-4">
              <Award className="text-green-600" size={48} />
            </div>
            <div className="flex-grow text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Calificaciones
              </h2>
              <p className="text-gray-600">
                Consulta tus notas y rendimiento académico
              </p>
            </div>
            <ChevronRight className="text-gray-500" size={32} />
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-600">
            <BookOpen size={20} />
            <span>Progreso Académico</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <CheckSquare size={20} />
            <span>Seguimiento de Tareas</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock size={20} />
            <span>Recordatorios</span>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
