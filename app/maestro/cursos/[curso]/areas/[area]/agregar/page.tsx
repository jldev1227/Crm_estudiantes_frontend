"use client";
import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { useMutation } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import DropzoneActividad from "@/components/dropzoneActividad";
import { CREAR_ACTIVIDAD } from "@/app/graphql/mutation/crearActividad";
import { formatearFechaColombiaParaInput } from "@/helpers/formatearFechaColombiaParaInput";
import Image from "next/image";

interface FormData {
  nombre: string;
  fecha: string;
  descripcion: string;
  fotos: string[];
}

export default function Page() {
  const params = useParams();
  const grado_id = params.curso as string;
  const area_id = params.area as string;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    fecha: formatearFechaColombiaParaInput(new Date()),
    descripcion: "",
    fotos: [],
  });

  // Mutación para crear actividad
  const [crearActividad] = useMutation(CREAR_ACTIVIDAD, {
    refetchQueries: ["ObtenerActividades"], // Refresca la lista de actividades después de crear una nueva
    onCompleted: () => {
      // Resetear el formulario y cerrar el modal al completar
      setFormData({
        nombre: "",
        fecha: formatearFechaColombiaParaInput(new Date()), // Formato completo: YYYY-MM-DDTHH:mm:ss.sssZ
        descripcion: "",
        fotos: [],
      });
      setUploadedUrls([]);
      setLoading(false);
      router.back();
    },
    onError: (error) => {
      console.error("Error al crear la actividad:", error);
      setError(error.message);
      setLoading(false);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Esta función recibe las URLs de las imágenes después de subirse
  const handleFileUpload = (urls: string[]) => {
    setUploadedUrls(urls);
    setFormData((prev) => ({ ...prev, fotos: urls }));
  };

  // Eliminar una imagen específica
  const removeImage = (index: number) => {
    const newUrls = [...uploadedUrls];
    newUrls.splice(index, 1);
    setUploadedUrls(newUrls);
    setFormData((prev) => ({ ...prev, fotos: newUrls }));
  };

  const handleSubmit = async () => {
    // Validación básica
    if (!formData.nombre.trim()) {
      setError("El nombre de la actividad es obligatorio");
      return;
    }

    if (!formData.descripcion.trim()) {
      setError("La descripción es obligatoria");
      return;
    }

    if (uploadedUrls.length === 0) {
      setError("Debes subir al menos una foto");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await crearActividad({
        variables: {
          input: {
            nombre: formData.nombre,
            fecha: formData.fecha,
            descripcion: formData.descripcion,
            fotos: formData.fotos,
            grado_id,
            area_id,
          },
        },
      });
    } catch (err) {
      // El error ya se maneja en onError del useMutation
      console.error("Error en el submit:", err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl text-primary font-bold">Crea una actividad</h1>
      </div>
      <div>
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Layout de grid: formulario a la izquierda (sticky), imágenes a la derecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Columna izquierda: Formulario (sticky) */}
          <div className="md:sticky md:top-0 md:self-start space-y-4">
            {/* Nombre de la actividad */}
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de la actividad
              </label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Taller de matemáticas"
                required
              />
            </div>

            {/* Fecha */}
            <div>
              <label
                htmlFor="fecha"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha
              </label>
              <Input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción
              </label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                placeholder="Describe la actividad..."
                required
              />
            </div>

            {/* Carga de fotos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fotos de la actividad
              </label>
              <DropzoneActividad onFileUpload={handleFileUpload} />
            </div>
          </div>

          {/* Columna derecha: Vista previa de imágenes (scrollable) */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">
              Archivos seleccionados ({uploadedUrls.length})
            </h3>

            {uploadedUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pr-2">
                {uploadedUrls.map((url, index) => (
                  <div
                    key={index}
                    className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={url}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                        aria-label="Eliminar imagen"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="p-2 bg-gray-50">
                      <p className="text-xs text-gray-500 truncate">
                        Imagen {index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <svg
                  className="w-12 h-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-gray-500">
                  No hay imágenes seleccionadas
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Las imágenes aparecerán aquí cuando las subas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-5">
        <Button
          color="danger"
          variant="light"
          onPress={() => router.back()}
          isDisabled={loading}
        >
          Cancelar
        </Button>
        <Button color="primary" onPress={handleSubmit} isLoading={loading}>
          {loading ? "Creando..." : "Crear actividad"}
        </Button>
      </div>
    </div>
  );
}
