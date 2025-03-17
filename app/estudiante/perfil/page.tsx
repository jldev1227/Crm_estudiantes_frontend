"use client";
import React, { useState } from 'react';
import { User, Calendar, Phone, GraduationCap, HashIcon, Check, X, Edit2 } from 'lucide-react';
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from 'react-hot-toast';
import { ACTUALIZAR_CONTACTO_ESTUDIANTE } from '@/app/graphql/mutation/actualizarContactoEstudiante';
import { useMutation } from '@apollo/client';

interface Usuario {
    id: string;
    nombre_completo?: string;
    celular?: string;
    direccion?: string;
    tipo_documento?: string;
    [key: string]: any; // Para permitir acceso dinámico a propiedades
}

// Tipo para los campos editables
type EditableField = keyof Omit<Usuario, 'id'>;

// Tipo para el estado de modo edición
interface EditMode {
    [field: string]: boolean;
}

// Tipo para los valores del formulario
interface FormValues {
    [field: string]: string;
}

export default function PerfilEstudiantePage() {
    const { usuario, actualizarUsuario } = useAuth();

    // Estados para controlar la edición
    const [editMode, setEditMode] = useState<EditMode>({
        tipo_documento: false,
        celular_padres: false
    });

    // Estados para los valores temporales de edición
    const [formValues, setFormValues] = useState<FormValues>({
        tipo_documento: usuario?.tipo_documento || '',
        celular_padres: usuario?.celular_padres || ''
    });

    // Configurar la mutación de GraphQL
    const [actualizarContactoEstudiante, { loading }] = useMutation(ACTUALIZAR_CONTACTO_ESTUDIANTE, {
        onCompleted: (data) => {
            if (data.actualizarContactoEstudiante.success) {
                toast.success(data.actualizarContactoEstudiante.mensaje);

                // Actualizar el contexto de autenticación con los nuevos datos
                if (data.actualizarContactoEstudiante.maestro) {
                    actualizarUsuario({
                        ...usuario,
                        ...data.actualizarContactoEstudiante.maestro
                    });
                }
            } else {
                toast.error(data.actualizarContactoEstudiante.mensaje);
            }
        },
        onError: (error) => {
            console.error("Error en la mutación:", error);
            toast.error("Error al actualizar datos. Intenta de nuevo.");
        }
    });

    // Updated handleChange and related functions with improved type handling
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value
        });
    };

    // Improved type-safe function for getting field values
    const getFieldValue = (usuario: Usuario | null, field: keyof Usuario): string => {
        if (!usuario || !(field in usuario)) return '';

        const value = usuario[field];
        return value !== undefined ? String(value) : '';
    };

    // Modify startEditing and cancelEditing to use the new getFieldValue function
    const startEditing = (field: EditableField): void => {
        setEditMode({ ...editMode, [field]: true });
        const fieldValue = getFieldValue(usuario, field);
        setFormValues({ ...formValues, [field]: fieldValue });
    };

    const cancelEditing = (field: EditableField): void => {
        setEditMode({ ...editMode, [field]: false });
        const fieldValue = getFieldValue(usuario, field);
        setFormValues({ ...formValues, [field]: fieldValue });
    };

    // Guardar cambios
    const saveChanges = async (field: EditableField): Promise<void> => {
        try {
            if (!usuario?.id) {
                toast.error("ID de usuario no disponible");
                return;
            }

            // Llamar a la mutación GraphQL
            await actualizarContactoEstudiante({
                variables: {
                    id: usuario.id,
                    input: {
                        [field]: formValues[field]
                    }
                }
            });

            // Actualizar el usuario localmente después de una actualización exitosa
            // Usar actualizarUsuario del contexto en lugar de setUsuario que no existe
            actualizarUsuario({
                ...usuario,
                [field]: formValues[field]
            });

            // Desactivar modo edición
            setEditMode({ ...editMode, [field]: false });

        } catch (error) {
            console.error("Error al actualizar datos:", error);
            toast.error("Error al actualizar datos. Inténtalo de nuevo.");
        }
    };


    const formatearFecha = (fecha: string | Date | undefined): string => {
        if (!fecha) return 'No';

        if (typeof fecha === 'string') {
            return fecha;
        }

        // Si es objeto Date, convertir a YYYY-MM-DD
        return fecha.toISOString().split('T')[0];
    };

    return (
        <ProtectedRoute allowedRoles={['estudiante']}>
            <div className="py-10 px-4">
                <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Encabezado del Perfil */}
                    <div className="bg-primary-500 text-white p-6 flex flex-col sm:flex-row gap-5 justify-center items-center sm:space-x-6">
                        <div className="bg-white bg-opacity-20 rounded-full p-4">
                            <User size={64} className="text-white" />
                        </div>
                        <div className="w-full">
                            <h1 className="text-xl sm:text-3xl font-bold">{usuario?.nombre_completo || 'Perfil Maestro'}</h1>
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
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-700">Tipo de Documento</h3>
                                        {!editMode.tipo_documento ? (
                                            <button
                                                onClick={() => startEditing('tipo_documento')}
                                                className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                                                disabled={loading}
                                            >
                                                <Edit2 size={16} className="mr-1" /> Editar
                                            </button>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => saveChanges('tipo_documento')}
                                                    className="text-green-500 hover:text-green-700"
                                                    disabled={loading}
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => cancelEditing('tipo_documento')}
                                                    className="text-red-500 hover:text-red-700"
                                                    disabled={loading}
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {!editMode.tipo_documento ? (
                                        <p className="text-gray-600">{usuario?.tipo_documento || 'No disponible'}</p>
                                    ) : (
                                        <select
                                            name="tipo_documento"
                                            value={formValues.tipo_documento}
                                            onChange={(e) => setFormValues({ ...formValues, tipo_documento: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            disabled={loading}
                                        >
                                            <option value="">Seleccione un tipo</option>
                                            <option value="RC">RC - Registro Civil</option>
                                            <option value="TI">TI - Tarjeta de Identidad</option>
                                            <option value="CC">CC - Cédula de Ciudadanía</option>
                                            <option value="CE">CE - Cédula de Extranjería</option>
                                        </select>
                                    )}
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
                                        {formatearFecha(usuario?.fecha_nacimiento)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 bg-gray-100 p-4 rounded-xl">
                                <Phone className="text-primary-500 shrink-0" size={40} />
                                <div className="min-w-0 w-full">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-700">Teléfono</h3>
                                        {!editMode.celular_padres ? (
                                            <button
                                                onClick={() => startEditing('celular_padres')}
                                                className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                                                disabled={loading}
                                            >
                                                <Edit2 size={16} className="mr-1" /> Editar
                                            </button>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => saveChanges('celular_padres')}
                                                    className="text-green-500 hover:text-green-700"
                                                    disabled={loading}
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => cancelEditing('celular_padres')}
                                                    className="text-red-500 hover:text-red-700"
                                                    disabled={loading}
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {!editMode.celular_padres ? (
                                        <p className="text-gray-600">{usuario?.celular_padres || 'No disponible'}</p>
                                    ) : (
                                        <input
                                            type="tel"
                                            name="celular_padres"
                                            value={formValues.celular_padres}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Número de teléfono"
                                            disabled={loading}
                                        />
                                    )}
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