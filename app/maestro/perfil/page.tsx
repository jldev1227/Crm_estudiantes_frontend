"use client";
import React, { Key, useState } from 'react';
import { User, Mail, Phone, Briefcase, HashIcon, Edit2, X, Check } from 'lucide-react';
import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import { ACTUALIZAR_CONTACTO_MAESTRO } from '@/app/graphql/mutation/actualizarContactoMaestro';

interface Usuario {
  id: string;
  nombre_completo?: string;
  celular?: string;
  direccion?: string;
  email?: string;
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

export default function PerfilMaestroPage() {
  const { usuario, actualizarUsuario } = useAuth();

  // Estados para controlar la edición
  const [editMode, setEditMode] = useState<EditMode>({
    email: false,
    celular: false
  });

  // Estados para los valores temporales de edición
  const [formValues, setFormValues] = useState<FormValues>({
    email: usuario?.email || '',
    celular: usuario?.celular || ''
  });

  // Configurar la mutación de GraphQL
  const [actualizarContactoMaestro, { loading }] = useMutation(ACTUALIZAR_CONTACTO_MAESTRO, {
    onCompleted: (data) => {
      if (data.actualizarContactoMaestro.success) {
        toast.success(data.actualizarContactoMaestro.mensaje);

        // Actualizar el contexto de autenticación con los nuevos datos
        if (data.actualizarContactoMaestro.maestro) {
          actualizarUsuario({
            ...usuario,
            ...data.actualizarContactoMaestro.maestro
          });
        }
      } else {
        toast.error(data.actualizarContactoMaestro.mensaje);
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
      await actualizarContactoMaestro({
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

  return (
    <ProtectedRoute allowedRoles={['maestro']}>
      <div className="py-10">
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

              {/* Correo Electrónico - Editable */}
              <div className="flex items-start space-x-4 bg-gray-100 p-4 rounded-xl">
                <Mail className="text-primary-500 shrink-0" size={40} />
                <div className="min-w-0 w-full">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Correo Electrónico</h3>
                    {!editMode.email ? (
                      <button
                        onClick={() => startEditing('email')}
                        className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                        disabled={loading}
                      >
                        <Edit2 size={16} className="mr-1" /> Editar
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveChanges('email')}
                          className="text-green-500 hover:text-green-700"
                          disabled={loading}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => cancelEditing('email')}
                          className="text-red-500 hover:text-red-700"
                          disabled={loading}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!editMode.email ? (
                    <p className="text-gray-600 break-all">{usuario?.email || 'No disponible'}</p>
                  ) : (
                    <input
                      type="email"
                      name="email"
                      value={formValues.email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Correo electrónico"
                      disabled={loading}
                    />
                  )}
                </div>
              </div>

              {/* Teléfono - Editable */}
              <div className="flex items-start space-x-4 bg-gray-100 p-4 rounded-xl">
                <Phone className="text-primary-500 shrink-0" size={40} />
                <div className="min-w-0 w-full">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Teléfono</h3>
                    {!editMode.celular ? (
                      <button
                        onClick={() => startEditing('celular')}
                        className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                        disabled={loading}
                      >
                        <Edit2 size={16} className="mr-1" /> Editar
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveChanges('celular')}
                          className="text-green-500 hover:text-green-700"
                          disabled={loading}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => cancelEditing('celular')}
                          className="text-red-500 hover:text-red-700"
                          disabled={loading}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!editMode.celular ? (
                    <p className="text-gray-600">{usuario?.celular || 'No disponible'}</p>
                  ) : (
                    <input
                      type="tel"
                      name="celular"
                      value={formValues.celular}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Número de teléfono"
                      disabled={loading}
                    />
                  )}
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