"use client";
import React from 'react';
import { User, Mail, Phone, Briefcase, HashIcon } from 'lucide-react';
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PerfilMaestroPage() {
  const { usuario } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['maestro']}>
      <div className="py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Encabezado del Perfil */}
          <div className="bg-primary-500 text-white p-6 flex flex-col sm:flex-row gap-5 justify-center items-center sm:space-x-6">
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <User size={64} className="text-white" />
            </div>
            <div className="w-full">
              <h1 className="text-xl sm:text-3xl font-bold">{usuario?.nombre || 'Perfil Maestro'}</h1>
              <p className="text-white text-opacity-80">Información Personal</p>
            </div>
          </div>

          {/* Detalles del Perfil */}
          <div className="p-6 space-y-6">
            {/* Información Personal */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 bg-gray-100 p-4 rounded-xl">
                <User className="text-primary-500 shrink-0" size={40} />
                <div className="min-w-0 w-full">
                  <h3 className="font-semibold text-gray-700">Tipo de Documento</h3>
                  <p className="text-gray-600">{usuario?.tipo_documento || 'No disponible'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-gray-100 p-4 rounded-xl">
                <HashIcon className="text-primary-500 shrink-0" size={40} />
                <div className="min-w-0 w-full">
                  <h3 className="font-semibold text-gray-700">Número de Identificación</h3>
                  <p className="text-gray-600">{usuario?.numero_identificacion || 'No disponible'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-gray-100 p-4 rounded-xl">
                <Mail className="text-primary-500 shrink-0" size={40} />
                <div className="min-w-0 w-full">
                  <h3 className="font-semibold text-gray-700">Correo Electrónico</h3>
                  <p className="text-gray-600 break-all">{usuario?.email || 'No disponible'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-gray-100 p-4 rounded-xl">
                <Phone className="text-primary-500 shrink-0" size={40} />
                <div className="min-w-0 w-full">
                  <h3 className="font-semibold text-gray-700">Teléfono</h3>
                  <p className="text-gray-600">{usuario?.celular || 'No disponible'}</p>
                </div>
              </div>
            </div>

            {/* Información Profesional */}
            <div className="bg-gray-100 p-4 rounded-xl flex items-start space-x-4">
              <Briefcase className="text-primary-500 shrink-0" size={40} />
              <div className="min-w-0 w-full">
                <h3 className="font-semibold text-gray-700">Información Profesional</h3>
                <p className="text-gray-600">
                  Maestro en Ejercicio
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS personalizados para manejar el desbordamiento */}
      <style jsx global>{`
        .truncate-text {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .overflow-wrap-anywhere {
          overflow-wrap: anywhere;
          word-break: break-all;
        }
      `}</style>
    </ProtectedRoute>
  );
}