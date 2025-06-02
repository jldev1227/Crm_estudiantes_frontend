"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Users } from 'lucide-react';

export default function CourseManagementWelcome() {
  const router = useRouter();

  const handleCourseNavigation = () => {
    router.push("/maestro/cursos");
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Bienvenido
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Gestiona tus cursos asignados, crea actividades y consulta tus estudiantes por área
        </p>
      </div>

      <div 
        onClick={handleCourseNavigation}
        className="w-full max-w-xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl px-5 py-8 sm:p-8 shadow-lg flex flex-col sm:flex-row max-sm:text-center items-center sm:space-x-6 gap-5">
          <div className="bg-white bg-opacity-20 rounded-full p-4">
            <GraduationCap size={64} className="text-white" />
          </div>
          <div className="md:flex-grow">
            <h2 className="text-2xl font-bold mb-2">Mis Cursos</h2>
            <p className="text-white text-opacity-80">
              Administra tus cursos y actividades
            </p>
          </div>
          <BookOpen size={32} className="text-white" />
        </div>
      </div>

      <div className="space-y-2 mt-8 md:flex md:space-x-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <BookOpen size={20} />
          <span>Gestión de Cursos</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Users size={20} />
          <span>Control de Estudiantes</span>
        </div>
      </div>
    </div>
  );
}