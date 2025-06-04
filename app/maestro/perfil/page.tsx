"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  HashIcon,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { useMutation } from "@apollo/client";
import { toast } from "react-hot-toast";

import { useAuth } from "@/app/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ACTUALIZAR_CONTACTO_MAESTRO } from "@/app/graphql/mutation/actualizarContactoMaestro";

interface Usuario {
  id: number;
  nombre_completo?: string;
  celular?: string;
  direccion?: string;
  email?: string;
  [key: string]: any;
}

type EditableField = keyof Omit<Usuario, "id">;

interface EditMode {
  [field: string]: boolean;
}

interface FormValues {
  [field: string]: string;
}

export default function PerfilMaestroPage() {
  const { usuario, actualizarUsuario } = useAuth();

  // Estados para controlar la edición
  const [editMode, setEditMode] = useState<EditMode>({
    email: false,
    celular: false,
  });

  // Estados para los valores temporales de edición
  const [formValues, setFormValues] = useState<FormValues>({
    email: "",
    celular: "",
  });

  // Estado para controlar si los datos están inicializados
  const [isInitialized, setIsInitialized] = useState(false);

  // Verificación principal de usuario y inicialización de datos
  useEffect(() => {
    if (usuario?.id) {
      // Inicializar formValues cuando el usuario esté disponible
      setFormValues({
        email: usuario.email || "",
        celular: usuario.celular || "",
      });
      setIsInitialized(true);
    } else {
      setIsInitialized(false);
    }
  }, [usuario]);

  // Configurar la mutación de GraphQL
  const [actualizarContactoMaestro, { loading }] = useMutation(
    ACTUALIZAR_CONTACTO_MAESTRO,
    {
      onCompleted: (data) => {
        if (data.actualizarContactoMaestro.success) {
          toast.success(data.actualizarContactoMaestro.mensaje);

          if (data.actualizarContactoMaestro.maestro) {
            actualizarUsuario({
              ...usuario,
              ...data.actualizarContactoMaestro.maestro,
            });
          }
        } else {
          toast.error(data.actualizarContactoMaestro.mensaje);
        }
      },
      onError: (error) => {
        console.error("Error en la mutación:", error);
        toast.error("Error al actualizar datos. Intenta de nuevo.");
      },
    },
  );

  // Verificación temprana - Si no hay usuario, mostrar loading o redirect
  if (!usuario || !usuario.id) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Cargando datos del usuario...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Verificación adicional para datos críticos
  if (!isInitialized) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-48 mx-auto mb-2" />
              <div className="h-4 bg-gray-300 rounded w-32 mx-auto" />
            </div>
            <p className="text-gray-600 mt-4">Inicializando perfil...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const getFieldValue = (
    usuario: Usuario | null,
    field: keyof Usuario,
  ): string => {
    if (!usuario || !(field in usuario)) return "";
    const value = usuario[field];

    return value !== undefined ? String(value) : "";
  };

  const startEditing = (field: EditableField): void => {
    // Verificación adicional antes de editar
    if (!usuario?.id) {
      toast.error("Usuario no disponible para edición");

      return;
    }

    setEditMode({ ...editMode, [field]: true });
    const fieldValue = getFieldValue(usuario, field);

    setFormValues({ ...formValues, [field]: fieldValue });
  };

  const cancelEditing = (field: EditableField): void => {
    if (!usuario) return;

    setEditMode({ ...editMode, [field]: false });
    const fieldValue = getFieldValue(usuario, field);

    setFormValues({ ...formValues, [field]: fieldValue });
  };

  const saveChanges = async (field: EditableField): Promise<void> => {
    try {
      // Verificaciones múltiples antes de guardar
      if (!usuario) {
        toast.error("Usuario no disponible");

        return;
      }

      if (!usuario.id) {
        toast.error("ID de usuario no disponible");

        return;
      }

      // Verificar que el valor no esté vacío para campos requeridos
      if (field === "email" && !formValues[field].trim()) {
        toast.error("El email no puede estar vacío");

        return;
      }

      // Validación básica de email
      if (field === "email" && formValues[field]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formValues[field])) {
          toast.error("Por favor ingresa un email válido");

          return;
        }
      }

      // Validación básica de celular
      if (field === "celular" && formValues[field]) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;

        if (!phoneRegex.test(formValues[field])) {
          toast.error("Por favor ingresa un número de celular válido");

          return;
        }
      }

      await actualizarContactoMaestro({
        variables: {
          id: usuario.id,
          input: {
            [field]: formValues[field],
          },
        },
      });

      actualizarUsuario({
        ...usuario,
        [field]: formValues[field],
      });

      setEditMode({ ...editMode, [field]: false });
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      toast.error("Error al actualizar datos. Inténtalo de nuevo.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["maestro"]}>
      <div className="p-4 md:p-10">
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Encabezado del Perfil */}
          <div className="bg-primary-500 text-white p-6 flex flex-col sm:flex-row gap-5 justify-center items-center sm:space-x-6">
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <User className="text-white" size={64} />
            </div>
            <div className="w-full">
              <h1 className="text-xl sm:text-3xl font-bold">
                {usuario?.nombre_completo || "Perfil Maestro"}
              </h1>
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
                  <h3 className="font-semibold text-gray-700">
                    Tipo de Documento
                  </h3>
                  <p className="text-gray-600">
                    {usuario?.tipo_documento || "No disponible"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-gray-100 p-4 rounded-xl">
                <HashIcon className="text-primary-500 shrink-0" size={40} />
                <div className="min-w-0 w-full">
                  <h3 className="font-semibold text-gray-700">
                    Número de Identificación
                  </h3>
                  <p className="text-gray-600">
                    {usuario?.numero_identificacion || "No disponible"}
                  </p>
                </div>
              </div>

              {/* Correo Electrónico - Editable */}
              <div className="flex items-start space-x-4 bg-gray-100 p-4 rounded-xl">
                <Mail className="text-primary-500 shrink-0" size={40} />
                <div className="min-w-0 w-full">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">
                      Correo Electrónico
                    </h3>
                    {!editMode.email ? (
                      <button
                        className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                        disabled={loading}
                        onClick={() => startEditing("email")}
                      >
                        <Edit2 className="mr-1" size={16} /> Editar
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          className="text-green-500 hover:text-green-700"
                          disabled={loading}
                          onClick={() => saveChanges("email")}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          disabled={loading}
                          onClick={() => cancelEditing("email")}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!editMode.email ? (
                    <p className="text-gray-600 break-all">
                      {usuario?.email || "No disponible"}
                    </p>
                  ) : (
                    <input
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      disabled={loading}
                      name="email"
                      placeholder="Correo electrónico"
                      type="email"
                      value={formValues.email}
                      onChange={handleChange}
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
                        className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                        disabled={loading}
                        onClick={() => startEditing("celular")}
                      >
                        <Edit2 className="mr-1" size={16} /> Editar
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          className="text-green-500 hover:text-green-700"
                          disabled={loading}
                          onClick={() => saveChanges("celular")}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          disabled={loading}
                          onClick={() => cancelEditing("celular")}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!editMode.celular ? (
                    <p className="text-gray-600">
                      {usuario?.celular || "No disponible"}
                    </p>
                  ) : (
                    <input
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      disabled={loading}
                      name="celular"
                      placeholder="Número de teléfono"
                      type="tel"
                      value={formValues.celular}
                      onChange={handleChange}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Información Profesional */}
            <div className="bg-gray-100 p-4 rounded-xl flex items-start space-x-4">
              <Briefcase className="text-primary-500 shrink-0" size={40} />
              <div className="min-w-0 w-full">
                <h3 className="font-semibold text-gray-700">
                  Información Profesional
                </h3>
                <p className="text-gray-600">Maestro en Ejercicio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
