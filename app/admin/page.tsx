"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Users } from 'lucide-react';

export default function CourseManagementWelcome() {
  const router = useRouter();

  return (
    <div className="bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Panel de Administración
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Administra cursos, maestros y calificaciones desde un solo lugar.
      </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
      <div
        onClick={() => router.push("/admin/cursos")}
        className="cursor-pointer bg-primary-500 text-white rounded-2xl px-5 py-8 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <BookOpen size={48} className="mb-4" />
        <h2 className="text-xl font-bold mb-2">Cursos</h2>
        <p className="text-white text-opacity-80 text-center">
        Gestiona todos los cursos disponibles.
        </p>
      </div>
      <div
        onClick={() => router.push("/admin/maestros")}
        className="cursor-pointer bg-primary-500 text-white rounded-2xl px-5 py-8 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <Users size={48} className="mb-4" />
        <h2 className="text-xl font-bold mb-2">Maestros</h2>
        <p className="text-white text-opacity-80 text-center">
        Administra la información de los maestros.
        </p>
      </div>
      <div
        onClick={() => router.push("/admin/calificaciones")}
        className="cursor-pointer bg-primary-500 text-white rounded-2xl px-5 py-8 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <GraduationCap size={48} className="mb-4" />
        <h2 className="text-xl font-bold mb-2">Calificaciones</h2>
        <p className="text-white text-opacity-80 text-center">
        Consulta y gestiona las calificaciones de los estudiantes.
        </p>
      </div>
      </div>
    </div>
  );
}