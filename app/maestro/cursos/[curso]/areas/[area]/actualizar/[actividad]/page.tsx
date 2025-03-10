"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { useMutation, useQuery } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import DropzoneActividad from "@/components/dropzoneActividad";
import { formatearFechaColombiaParaInput } from "@/helpers/formatearFechaColombiaParaInput";
import { ACTUALIZAR_ACTIVIDAD } from "@/app/graphql/mutation/actualizarActividad";
import { OBTENER_ACTIVIDAD } from "@/app/graphql/queries/obtenerActividad";

interface FormData {
  nombre: string;
  fecha: string;
  descripcion: string;
  fotos: string[];
  fotosNuevas?: string[];
  reemplazarFotos?: boolean;
}

// Componente principal
export default function ActualizarActividadPage() {
  // Hooks y Estado
  const params = useParams();
  const router = useRouter();
  const grado_id = params.curso as string;
  const area_id = params.area as string;
  const actividad_id = params.actividad as string;

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    fecha: formatearFechaColombiaParaInput(new Date()),
    descripcion: "",
    fotos: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [reemplazarFotos, setReemplazarFotos] = useState(false);

  // GraphQL Queries y Mutations
  const { data, loading: loadingActividad } = useQuery(OBTENER_ACTIVIDAD, {
    variables: { id: actividad_id },
    onCompleted: (data) => {
      if (data?.obtenerActividad) {
        const actividad = data.obtenerActividad;
        const timestamp = parseInt(actividad.fecha, 10);
        const fechaObj = new Date(timestamp);

        setFormData({
          nombre: actividad.nombre,
          fecha: formatearFechaColombiaParaInput(fechaObj),
          descripcion: actividad.descripcion,
          fotos: actividad.fotos || [],
        });
        setUploadedUrls(actividad.fotos || []);
      }
    },
    onError: (error) => {
      setError("Error al cargar la actividad: " + error.message);
    },
  });

  const [actualizarActividad] = useMutation(ACTUALIZAR_ACTIVIDAD, {
    refetchQueries: ["ObtenerActividades"],
    onCompleted: () => {
      router.back();
    },
    onError: (error) => {
      console.error("Error al actualizar la actividad:", error);
      setError(error.message);
      setLoading(false);
    },
  });

  // Funciones auxiliares memoizadas
  const getImageSrc = useCallback((url: string) => {
    if (!url) return "";

    if (url.startsWith("data:")) {
      return url;
    } else if (url.includes("blob.core.windows.net")) {
      return `${url}?${process.env.NEXT_PUBLIC_AZURE_KEY}`;
    } else {
      return url;
    }
  }, []);

  // Handlers
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleFileUpload = useCallback(
    (urls: string[]) => {
      setUploadedUrls((prev) => [...prev, ...urls]);
      setFormData((prev) => ({
        ...prev,
        fotosNuevas: urls,
        fotos: reemplazarFotos ? urls : [...prev.fotos, ...urls],
      }));
    },
    [reemplazarFotos],
  );

  const removeImage = useCallback((index: number) => {
    setUploadedUrls((prev) => {
      const newUrls = [...prev];
      newUrls.splice(index, 1);
      return newUrls;
    });

    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
    }));
  }, []);

  const toggleReemplazarFotos = useCallback(() => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar todas las fotos existentes?",
    );
    if (confirmar) {
      setReemplazarFotos(true);
      setUploadedUrls([]);
      setFormData((prev) => ({ ...prev, fotos: [] }));
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validación básica
    if (!formData.nombre.trim()) {
      setError("El nombre de la actividad es obligatorio");
      return;
    }

    if (!formData.descripcion.trim()) {
      setError("La descripción es obligatoria");
      return;
    }

    if (formData.fotos.length === 0) {
      setError("Debes tener al menos una foto");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await actualizarActividad({
        variables: {
          id: actividad_id,
          input: {
            nombre: formData.nombre,
            fecha: formData.fecha,
            descripcion: formData.descripcion,
            fotosNuevas: formData.fotosNuevas || [],
            reemplazarFotos,
            grado_id,
            area_id,
          },
        },
      });
    } catch (err) {
      console.error("Error en el submit:", err);
    }
  }, [
    formData,
    reemplazarFotos,
    actividad_id,
    grado_id,
    area_id,
    actualizarActividad,
  ]);

  // Estados derivados
  const maxRemainingImages = useMemo(
    () => 10 - uploadedUrls.length,
    [uploadedUrls.length],
  );
  const isMaxImagesReached = useMemo(
    () => uploadedUrls.length >= 10,
    [uploadedUrls.length],
  );

  // Condicionales de renderizado
  if (loadingActividad) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-medium text-gray-700">
          Cargando información de la actividad...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl text-primary font-bold">
          Actualizar actividad
        </h1>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Layout de grid: formulario a la izquierda (sticky), imágenes a la derecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Columna izquierda: Formulario (sticky) */}
        <div className="md:sticky md:top-0 md:self-start space-y-4">
          {/* Campos del formulario */}
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

          {/* Gestión de imágenes */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">
              Gestión de imágenes
            </p>

            <div className="mb-4 p-3 bg-gray-50 rounded border">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="reemplazarFotos"
                    name="reemplazarFotos"
                    type="checkbox"
                    checked={reemplazarFotos}
                    onChange={toggleReemplazarFotos}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="reemplazarFotos"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Eliminar todas las fotos existentes
                  </label>
                </div>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              {uploadedUrls.length > 0 ? "Añadir más fotos" : "Subir fotos"}
              <span className="text-xs text-gray-500 ml-2">
                ({uploadedUrls.length}/10 imágenes)
              </span>
            </label>

            {isMaxImagesReached ? (
              <p className="text-sm text-amber-600 mb-2">
                Has alcanzado el límite máximo de 10 imágenes
              </p>
            ) : (
              <DropzoneActividad
                onFileUpload={handleFileUpload}
                maxFiles={maxRemainingImages}
              />
            )}
          </div>
        </div>

        {/* Columna derecha: Vista previa de imágenes */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">
            Fotos de la actividad ({uploadedUrls.length})
          </h3>

          {uploadedUrls.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pr-2">
              {uploadedUrls.map((url, index) => (
                <div
                  key={index}
                  className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square">
                    <img
                      src={getImageSrc(url)}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/placeholder-image.jpg";
                      }}
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                      aria-label="Eliminar imagen"
                      type="button"
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

      {/* Botones de acción */}
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
          {loading ? "Actualizando..." : "Actualizar actividad"}
        </Button>
      </div>
    </div>
  );
}
