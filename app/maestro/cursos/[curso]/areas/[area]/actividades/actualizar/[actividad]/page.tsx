"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { useMutation, useQuery } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import DropzoneActividad from "@/components/dropzoneActividad";
import { formatearFechaColombiaParaInput } from "@/helpers/formatearFechaColombiaParaInput";
import { ACTUALIZAR_ACTIVIDAD } from "@/app/graphql/mutation/actualizarActividad";
import { OBTENER_ACTIVIDAD } from "@/app/graphql/queries/obtenerActividad";
import NextPDFPreview from "@/components/pdfPreview";
import { formatearFecha } from "@/helpers/formatearFecha";
import toast from "react-hot-toast";

interface ArchivoActividad {
  url: string;
  nombre: string;
  tipo: string;
}

interface FormData {
  nombre: string;
  fecha: string;
  hora: string;
  descripcion: string;
  fotos: ArchivoActividad[];
  fotosNuevas?: ArchivoActividad[];
  pdfsNuevos?: ArchivoActividad[];
  reemplazarFotos?: boolean;
  reemplazarPdfs?: boolean;
}

// Función auxiliar para determinar el tipo de archivo por la extensión o URL
const detectarTipoArchivo = (url: string): string => {
  if (!url) return "application/octet-stream";

  // Para data URIs - extraer el tipo directamente
  if (url.startsWith('data:')) {
    const match = url.match(/^data:([^;]+);/);
    if (match && match[1]) {
      return match[1];
    }

    // Si es data URI de imagen pero no se puede extraer el tipo exacto
    if (url.startsWith('data:image/')) {
      return 'image/jpeg';
    }
  }

  // Para URLs normales - inferir por extensión o path
  if (url.toLowerCase().endsWith('.pdf') || url.includes('/PDFs/')) {
    return "application/pdf";
  } else if (
    url.toLowerCase().endsWith('.jpg') ||
    url.toLowerCase().endsWith('.jpeg')
  ) {
    return "image/jpeg";
  } else if (url.toLowerCase().endsWith('.png')) {
    return "image/png";
  } else if (url.toLowerCase().endsWith('.gif')) {
    return "image/gif";
  } else if (
    url.includes('/images/') ||
    url.includes('/fotos/')
  ) {
    return "image/jpeg"; // Asumimos JPEG por defecto para paths de imagen
  }

  // Por defecto, lo tratamos como archivo genérico
  return "application/octet-stream";
};

// Función para extraer el nombre de archivo de una URL o data URI
const extraerNombreArchivo = (url: string): string => {
  // Para data URIs, crear un nombre genérico que indique el tipo
  if (url.startsWith('data:')) {
    const tipo = detectarTipoArchivo(url);
    if (tipo.startsWith('image/')) {
      return `imagen_${new Date().getTime().toString().slice(-6)}.jpg`;
    } else if (tipo === 'application/pdf') {
      return `documento_${new Date().getTime().toString().slice(-6)}.pdf`;
    }
    return `archivo_${new Date().getTime().toString().slice(-6)}`;
  }

  // Para URLs normales, extraer el nombre del archivo de la ruta
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const fileName = pathSegments[pathSegments.length - 1];

    // Si tiene un nombre de archivo válido
    if (fileName && fileName.length > 0 && fileName !== '/') {
      return decodeURIComponent(fileName);
    }
  } catch (e) {
    // Si no es una URL válida, intentamos extraer el último segmento después de /
    const segments = url.split('/');
    const lastSegment = segments[segments.length - 1];
    if (lastSegment && lastSegment.length > 0) {
      return lastSegment;
    }
  }

  // Si todo lo anterior falla
  return `archivo_${new Date().getTime().toString().slice(-6)}`;
};

// Función para convertir strings de URL a objetos de archivo
const convertirUrlAArchivo = (url: string): ArchivoActividad => {
  const tipo = detectarTipoArchivo(url);
  const nombre = extraerNombreArchivo(url);
  return { url, nombre, tipo };
};

// Función para verificar si una URL es externa (https)
const esUrlExterna = (url: string): boolean => {
  return url.startsWith('https://') || url.startsWith('http://');
};

// Función para verificar si un archivo es descargable
const esArchivoDescargable = (archivo: ArchivoActividad): boolean => {
  // Es descargable si es una URL externa y no es una imagen ni un PDF
  return esUrlExterna(archivo.url)
};

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
    hora: "",
    descripcion: "",
    fotos: [],
    fotosNuevas: [],
    pdfsNuevos: [],
    reemplazarFotos: false,
    reemplazarPdfs: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<ArchivoActividad[]>([]);

  // GraphQL Queries y Mutations
  const { data, loading: loadingActividad } = useQuery(OBTENER_ACTIVIDAD, {
    variables: { id: actividad_id },
    onCompleted: (data) => {
      if (data?.obtenerActividad) {
        const actividad = data.obtenerActividad;

        // Formatear fecha para el input (YYYY-MM-DD)
        const fechaOriginal = formatearFecha(actividad.fecha); // Ejemplo: "17/03/2025"
        (fechaOriginal)
        const partes = fechaOriginal.split('/');
        const fechaFormateada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;

        // Convertir URLs a objetos de archivo con tipo
        const archivosExistentes: ArchivoActividad[] = [];

        // Procesar fotos (pueden ser URLs o data URIs)
        if (Array.isArray(actividad.fotos)) {
          actividad.fotos.forEach((url: string) => {
            archivosExistentes.push(convertirUrlAArchivo(url));
          });
        }

        // Procesar PDFs
        if (Array.isArray(actividad.pdfs)) {
          actividad.pdfs.forEach((url: string) => {
            archivosExistentes.push(convertirUrlAArchivo(url));
          });
        }

        // Actualizar el estado con los datos de la actividad
        setFormData({
          nombre: actividad.nombre || "",
          fecha: fechaFormateada,
          hora: actividad.hora || "",
          descripcion: actividad.descripcion || "",
          fotos: archivosExistentes,
          fotosNuevas: [],
          pdfsNuevos: [],
          reemplazarFotos: false,
          reemplazarPdfs: false
        });

        // Actualizar la lista de URLs
        setUploadedUrls(archivosExistentes);
      }
    },
    onError: (error) => {
      setError("Error al cargar la actividad: " + error.message);
      console.error("Error detallado:", error);
    },
  });

  const [actualizarActividad] = useMutation(ACTUALIZAR_ACTIVIDAD, {
    refetchQueries: ["ObtenerActividades"],
    onCompleted: () => {
      toast.success(`¡Tarea "${formData.nombre}" actualizada correctamente!`, {
        duration: 4000,
        position: 'top-center',
        icon: '✅'
      });

      router.back();
    },
    onError: (error) => {
      console.error("Error al actualizar la actividad:", error);
      setError(error.message);
      setLoading(false);
    },
  });

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
      // Convertir las nuevas URLs a objetos de archivo con tipo
      const nuevosArchivos = urls.map(url => convertirUrlAArchivo(url));

      setUploadedUrls(prev => [...prev, ...nuevosArchivos]);

      setFormData(prev => {
        // Separar archivos nuevos por tipo (imagen o PDF)
        const nuevasFotos: ArchivoActividad[] = [];
        const nuevosPdfs: ArchivoActividad[] = [];

        nuevosArchivos.forEach(archivo => {
          if (archivo.tipo === 'application/pdf') {
            nuevosPdfs.push(archivo);
          } else {
            nuevasFotos.push(archivo);
          }
        });

        return {
          ...prev,
          fotosNuevas: [...(prev.fotosNuevas || []), ...nuevasFotos],
          pdfsNuevos: [...(prev.pdfsNuevos || []), ...nuevosPdfs],
          fotos: [...prev.fotos, ...nuevosArchivos]
        };
      });
    },
    [],
  );

  const removeFile = useCallback((index: number) => {
    // Obtener el archivo que se va a eliminar
    const archivoAEliminar = uploadedUrls[index];

    setUploadedUrls(prev => {
      const newUrls = [...prev];
      newUrls.splice(index, 1);
      return newUrls;
    });

    setFormData(prev => {
      // Eliminar de la lista general de archivos
      const nuevosFotos = prev.fotos.filter((_, i) => i !== index);

      // También eliminar de fotosNuevas o pdfsNuevos si es un archivo nuevo
      let nuevasFotosNuevas = [...(prev.fotosNuevas || [])];
      let nuevosPdfsNuevos = [...(prev.pdfsNuevos || [])];

      if (archivoAEliminar.tipo === 'application/pdf') {
        nuevosPdfsNuevos = nuevosPdfsNuevos.filter(a => a.url !== archivoAEliminar.url);
      } else {
        nuevasFotosNuevas = nuevasFotosNuevas.filter(a => a.url !== archivoAEliminar.url);
      }

      return {
        ...prev,
        fotos: nuevosFotos,
        fotosNuevas: nuevasFotosNuevas,
        pdfsNuevos: nuevosPdfsNuevos
      };
    });

    // Limpiar advertencia si se elimina un archivo
    setError("");
  }, [uploadedUrls]);

  const toggleReemplazarFotos = useCallback(() => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar todas las fotos e imágenes existentes?",
    );
    if (confirmar) {
      // Limpiar todos los archivos
      setUploadedUrls([]);

      setFormData(prev => ({
        ...prev,
        fotos: [],
        fotosNuevas: [],
        pdfsNuevos: [],
        reemplazarFotos: true,
        reemplazarPdfs: true
      }));
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

    setLoading(true);
    setError("");

    // Separar archivos existentes y nuevos
    const archivosExistentes = uploadedUrls.filter(archivo => !archivo.url.startsWith('data:'));
    const archivosNuevos = uploadedUrls.filter(archivo => archivo.url.startsWith('data:'));

    // Separar por tipo de archivo
    const fotosExistentes = archivosExistentes
      .filter(archivo => archivo.tipo.startsWith('image/'))
      .map(archivo => archivo.url);

    const pdfsExistentes = archivosExistentes
      .filter(archivo => archivo.tipo === 'application/pdf')
      .map(archivo => archivo.url);

    const fotosNuevas = archivosNuevos
      .filter(archivo => archivo.tipo.startsWith('image/'))
      .map(archivo => archivo.url);

    const pdfsNuevos = archivosNuevos
      .filter(archivo => archivo.tipo === 'application/pdf')
      .map(archivo => archivo.url);

    try {
      await actualizarActividad({
        variables: {
          id: actividad_id,
          input: {
            nombre: formData.nombre,
            fecha: formData.fecha,
            hora: formData.hora,
            descripcion: formData.descripcion,
            fotosAConservar: fotosExistentes,
            pdfsAConservar: pdfsExistentes,
            fotosNuevas: fotosNuevas,
            pdfsNuevos: pdfsNuevos,
            reemplazarFotos: formData.reemplazarFotos,
            reemplazarPdfs: formData.reemplazarPdfs,
            grado_id,
            area_id
          },
        },
      });
    } catch (err) {
      console.error("Error en el submit:", err);
      setLoading(false);
      if (err instanceof Error) {
        setError(`Error al actualizar: ${err.message}`);
      }
    }
  }, [
    formData,
    actividad_id,
    grado_id,
    area_id,
    actualizarActividad,
    uploadedUrls,
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

  // Función mejorada para detectar el tipo de archivo
  // Función mejorada para detectar el tipo de archivo con más especificidad para SVG
  const detectarTipoArchivo = (url: string): string => {
    if (!url) return "application/octet-stream";

    // Para data URIs - extraer el tipo directamente
    if (url.startsWith('data:')) {
      const match = url.match(/^data:([^;]+);/);
      if (match && match[1]) {
        return match[1];
      }

      // Detección específica para diferentes tipos de data URIs
      if (url.startsWith('data:image/svg+xml')) {
        return 'image/svg+xml';
      } else if (url.startsWith('data:image/')) {
        return 'image/jpeg';
      } else if (url.startsWith('data:application/pdf')) {
        return 'application/pdf';
      }
    }

    // Para URLs normales - inferir por extensión o path
    // Verificación de SVG con múltiples patrones
    if (
      url.toLowerCase().endsWith('.svg') ||
      url.toLowerCase().includes('.svg%2bxml') ||
      url.toLowerCase().includes('.svg%2Bxml') ||
      url.toLowerCase().includes('svg+xml') ||
      url.includes('/SVG/')
    ) {
      return "image/svg+xml";
    }

    // Para PDF
    if (url.toLowerCase().endsWith('.pdf') || url.includes('/PDFs/')) {
      return "application/pdf";
    }

    // Para imágenes comunes
    if (url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.jpeg')) {
      return "image/jpeg";
    } else if (url.toLowerCase().endsWith('.png')) {
      return "image/png";
    } else if (url.toLowerCase().endsWith('.gif')) {
      return "image/gif";
    }

    // Inferencia por path
    if (url.includes('/images/') || url.includes('/fotos/')) {
      // Buscar patrones adicionales para SVG en rutas
      if (url.includes('svg') || url.includes('SVG')) {
        return 'image/svg+xml';
      }
      return "image/jpeg"; // Asumimos JPEG por defecto para paths de imagen
    }

    // Inspección adicional para SVG basada en la URL completa
    if (url.includes('svg') || url.includes('SVG')) {
      return 'image/svg+xml';
    }

    // Por defecto, lo tratamos como archivo genérico
    return "application/octet-stream";
  };

  // Componente mejorado para renderizar diferentes tipos de archivos incluyendo octet-stream
  const renderizarArchivo = (archivo: { tipo: string, url: string, nombre: string }, index: number, onRemove: any) => {
    // Determinar si es SVG basado en múltiples condiciones
    const esSVG =
      archivo.tipo === 'image/svg+xml' ||
      archivo.url.toLowerCase().includes('svg') ||
      archivo.nombre.toLowerCase().includes('svg');

    // Determinar si es una imagen basado en el tipo o la URL
    const esImagen =
      archivo.tipo.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'gif'].some(ext =>
        archivo.url.toLowerCase().includes(ext) ||
        archivo.nombre.toLowerCase().includes(ext)
      );

    // Para archivos desconocidos, intentar renderizar como imagen si tiene patrones de imagen
    const intentarComoImagen = archivo.tipo === 'application/octet-stream' && (
      archivo.url.includes('/fotos/') ||
      archivo.url.includes('/images/') ||
      ['jpg', 'jpeg', 'png', 'gif'].some(ext =>
        archivo.url.toLowerCase().includes(ext) ||
        archivo.nombre.toLowerCase().includes(ext)
      )
    );

    const urlCompleta = archivo.url.startsWith("https://")
      ? `${archivo.url}?${process.env.NEXT_PUBLIC_AZURE_KEY}`
      : archivo.url;

    // Renderizado según el tipo detectado
    if (archivo.tipo === 'application/pdf') {
      return (
        <NextPDFPreview
          pdfUrl={archivo.url}
          fileName={archivo.nombre}
          onRemove={() => onRemove(index)}
        />
      );
    } else if (esSVG || esImagen || intentarComoImagen) {
      return (
        <div className="relative aspect-square">
          <img
            src={urlCompleta}
            alt={`Archivo ${index + 1}: ${archivo.nombre}`}
            className={`w-full h-full ${esSVG ? 'object-contain p-2' : 'object-cover'} rounded-t-lg`}
            onError={(e: any) => {
              console.error(`Error al cargar imagen: ${archivo.url}`);
              e.target.src = '/placeholder-image.png'; // Imagen de reemplazo si falla
              e.target.className = 'w-full h-full object-contain p-2 rounded-t-lg opacity-50';
            }}
          />
          <button
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
            aria-label="Eliminar archivo"
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
      );
    } else {
      // Archivo genérico
      return (
        <div className="relative aspect-square bg-gray-100 flex items-center justify-center rounded-t-lg">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
          <button
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
            aria-label="Eliminar archivo"
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
      );
    }
  };

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
              htmlFor="hora"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hora
            </label>
            <Input
              type="time"
              id="hora"
              name="hora"
              value={formData.hora}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {uploadedUrls.length > 0 ? "Añadir más archivos" : "Subir archivos"}
              <span className="text-xs text-gray-500 ml-2">
                ({uploadedUrls.length}/10 archivos)
              </span>
            </label>

            {isMaxImagesReached ? (
              <p className="text-sm text-amber-600 mb-2">
                Has alcanzado el límite máximo de 10 archivos
              </p>
            ) : (
              <DropzoneActividad
                onFileUpload={handleFileUpload}
                maxFiles={maxRemainingImages}
              />
            )}
          </div>

          {/* Botón para reemplazar todos los archivos */}
          <div className="mt-4">
            <Button
              color="danger"
              variant="light"
              onPress={toggleReemplazarFotos}
              isDisabled={uploadedUrls.length === 0}
              className="w-full"
            >
              Eliminar todos los archivos
            </Button>
          </div>
        </div>

        {/* Columna derecha: Vista previa de imágenes */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">
            Archivos de la actividad ({uploadedUrls.length})
          </h3>

          {uploadedUrls.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pr-2">
              {uploadedUrls.map((archivo, index) => (
                <div
                  key={index}
                  className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  {renderizarArchivo(archivo, index, removeFile)}

                  <div className="p-2 bg-gray-50 rounded-b-lg">
                    {esArchivoDescargable(archivo) ? (
                      <a
                        href={`${archivo.url}?${process.env.NEXT_PUBLIC_AZURE_KEY}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        title="Descargar archivo"
                      >
                        <p className="text-xs text-blue-500 truncate hover:underline">
                          {archivo.nombre}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Descargar archivo
                        </p>
                      </a>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 truncate" title={archivo.nombre}>
                          {archivo.nombre.length > 18 ? `${archivo.nombre.substring(0, 15)}...` : archivo.nombre}
                        </p>
                        <p className="text-xs text-gray-400">
                          {archivo.tipo === 'image/svg+xml'
                            ? 'SVG'
                            : archivo.tipo.startsWith('image/')
                              ? 'Imagen'
                              : archivo.tipo === 'application/pdf'
                                ? 'PDF'
                                : archivo.url.includes('svg') || archivo.nombre.includes('svg')
                                  ? 'SVG'
                                  : 'Archivo'}
                        </p>
                      </>
                    )}
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
                No hay archivos seleccionados
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Los archivos aparecerán aquí cuando los subas
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
    </div >
  );
}