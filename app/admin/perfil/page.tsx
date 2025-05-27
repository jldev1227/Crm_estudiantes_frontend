"use client";
import React from 'react';
import { User, Mail, Shield, Clock, Calendar, Activity } from 'lucide-react';
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PerfilAdministradorPage() {
  const { usuario } = useAuth();

  // Función para formatear fecha
const formatearFecha = (timestamp: string | number): string => {
    try {
        // Si es string, intenta convertirlo a number
        let ts = typeof timestamp === "string" ? Number(timestamp) : timestamp;
        if (isNaN(ts)) return "Fecha inválida";
        // Si el número es menor a 10^12, asumimos que está en segundos, si no en milisegundos
        if (ts < 1e12) ts = ts * 1000;
        const fecha = new Date(ts);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Fecha inválida';
    }
};

  // Función para obtener el color del rol
  const getRolColor = (rol: string): string => {
    switch (rol?.toLowerCase()) {
      case 'admin':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'super_admin':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'moderador':
        return 'text-green-700 bg-green-100 border-green-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  // Función para obtener el estado de actividad
  const getEstadoColor = (activo: boolean): string => {
    return activo 
      ? 'text-green-700 bg-green-100 border-green-200'
      : 'text-red-700 bg-red-100 border-red-200';
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <div className="py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
          
          {/* Encabezado del Perfil */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <Shield size={64} className="text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {usuario?.nombre_completo || 'Administrador'}
                </h1>
                <p className="text-blue-100 mt-1">Panel de Administración</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRolColor(usuario?.rol || '')}`}>
                    {usuario?.rol?.toUpperCase() || 'ADMIN'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(usuario?.activo ?? false)}`}>
                    {usuario?.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Perfil */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Correo Electrónico */}
              <div className="bg-gray-50 p-6 rounded-xl border">
                <div className="flex items-start space-x-4">
                  <Mail className="text-blue-600 shrink-0 mt-1" size={24} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">Correo Electrónico</h3>
                    <p className="text-gray-600 break-all">{usuario?.email}</p>
                  </div>
                </div>
              </div>

              {/* Último Acceso */}
              <div className="bg-gray-50 p-6 rounded-xl border">
                <div className="flex items-start space-x-4">
                  <Clock className="text-green-600 shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Último Acceso</h3>
                    <p className="text-gray-600">
                      {usuario?.ultimo_login ? formatearFecha(usuario.ultimo_login) : 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fecha de Creación */}
              <div className="bg-gray-50 p-6 rounded-xl border">
                <div className="flex items-start space-x-4">
                  <Calendar className="text-purple-600 shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Fecha de Creación</h3>
                    <p className="text-gray-600">
                      {usuario?.createdAt ? formatearFecha(usuario.createdAt) : 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Actividad Reciente */}
            <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
              <div className="flex items-start space-x-4">
                <Activity className="text-indigo-600 shrink-0 mt-1" size={24} />
                <div className="w-full">
                  <h3 className="font-semibold text-gray-800 mb-3">Información de Actividad</h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Última actualización:</span>
                      <p className="text-gray-600 mt-1">
                        {usuario?.updatedAt ? formatearFecha(usuario.updatedAt) : 'No disponible'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Estado de cuenta:</span>
                      <p className={`mt-1 font-medium ${usuario?.activo ? 'text-green-600' : 'text-red-600'}`}>
                        {usuario?.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}