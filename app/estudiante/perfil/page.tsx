"use client";
import React from 'react';
import { User, Calendar, Phone, GraduationCap, HashIcon } from 'lucide-react';
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PerfilEstudiantePage() {
    const { usuario } = useAuth();

    // Función para formatear fecha de nacimiento
    const formatFechaNacimiento = (fecha?: Date | string | null) => {
        try {
            if (!fecha) return 'No disponible';

            // Convertir a objeto Date si es un string
            const fechaDate = fecha instanceof Date
                ? fecha
                : new Date(fecha);

            return fechaDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return 'Formato de fecha inválido';
        }
    };

    return (
        <ProtectedRoute allowedRoles={['estudiante']}>
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
                            <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-xl">
                                <User className="text-primary-500" size={40} />
                                <div>
                                    <h3 className="font-semibold text-gray-700">Tipo de Documento</h3>
                                    <p className="text-gray-600">{usuario?.tipo_documento || 'No disponible'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-xl">
                                <HashIcon className="text-primary-500" size={40} />
                                <div>
                                    <h3 className="font-semibold text-gray-700">Número de Identificación</h3>
                                    <p className="text-gray-600">{usuario?.numero_identificacion || 'No disponible'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-xl">
                                <Calendar className="text-primary-500" size={40} />
                                <div>
                                    <h3 className="font-semibold text-gray-700">Fecha de Nacimiento</h3>
                                    <p className="text-gray-600">
                                        {formatFechaNacimiento(usuario?.fecha_nacimiento)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-xl">
                                <Phone className="text-primary-500" size={40} />
                                <div>
                                    <h3 className="font-semibold text-gray-700">Teléfono de Padres</h3>
                                    <p className="text-gray-600">{usuario?.celular_padres || 'No disponible'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Información Académica */}
                        <div className="bg-gray-100 p-4 rounded-xl flex items-center space-x-4">
                            <GraduationCap className="text-primary-500" size={40} />
                            <div>
                                <h3 className="font-semibold text-gray-700">Información Académica</h3>
                                <p className="text-gray-600">
                                    Grado: {usuario?.grado_id ? usuario.grado_nombre : 'No asignado'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}