"use client";

import React, { useEffect, useState } from "react";
import { Users, Plus, Search, Filter, UserCheck, AlertCircle, Loader2, BookOpen, Award, Clock } from "lucide-react";

import { useAdmin } from "@/app/context/AdminContext";
import MaestrosResponsive from "@/components/maestroResponsive";

export default function Page() {
  const { maestros, estaCargando, obtenerMaestros, estadisticas } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    obtenerMaestros();
  }, []);

  const filteredMaestros = maestros.filter(maestro =>
    maestro.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maestro.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <Loader2 className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700">Cargando maestros...</h3>
        <p className="text-gray-500">Por favor espera un momento</p>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16 space-y-6">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-700">No hay maestros registrados</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Parece que aún no se han registrado maestros en el sistema. 
          Comienza agregando el primer maestro para empezar a gestionar el equipo docente.
        </p>
      </div>
      <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25">
        <Plus className="w-5 h-5" />
        <span>Agregar Primer Maestro</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-6">
        {/* Title and Description */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Gestión de Maestros
              </h1>
              <p className="text-gray-600 mt-1">
                Administra el equipo docente, asigna cursos y consulta información detallada
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden">
        {estaCargando ? (
          <LoadingState />
        ) : filteredMaestros.length > 0 ? (
          <div className="p-6">
            {searchTerm && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-700">
                  <span className="font-medium">
                    {filteredMaestros.length} resultado(s) encontrado(s)
                  </span>
                  {searchTerm && (
                    <span> para "{searchTerm}"</span>
                  )}
                </p>
              </div>
            )}
            <MaestrosResponsive maestros={filteredMaestros} />
          </div>
        ) : searchTerm ? (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">No se encontraron resultados</h3>
              <p className="text-gray-500">
                No hay maestros que coincidan con "{searchTerm}"
              </p>
            </div>
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}