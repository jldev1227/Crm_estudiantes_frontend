"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, User, ChevronRight } from "lucide-react";

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div
          className="w-full cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          role="button"
          onClick={() => router.push("/admin/cursos")}
        >
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl px-5 py-8 sm:p-8 shadow-lg flex flex-col sm:flex-row max-sm:text-center items-center sm:space-x-6 gap-5">
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <GraduationCap className="text-white" size={64} />
            </div>
            <div className="md:flex-grow">
              <h2 className="text-2xl font-bold mb-2">Cursos</h2>
              <p className="text-white text-opacity-80">
                Gestiona todos los cursos disponibles
              </p>
            </div>
            <ChevronRight className="text-white" size={32} />
          </div>
        </div>
        <div
          className="bg-gray-100 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center sm:space-x-6 gap-5 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          role="button"
          onClick={() => router.push("/admin/maestros")}
        >
          <div className="bg-gray-500 bg-opacity-20 rounded-full p-4">
            <User className="text-gray-500" size={48} />
          </div>
          <div className="flex-grow text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Maestros</h2>
            <p className="text-gray-600">
              Administra la informacion de los maestros
            </p>
          </div>
          <ChevronRight className="text-gray-500" size={32} />
        </div>
      </div>
    </div>
  );
}
