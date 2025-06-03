"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useMutation, useQuery } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";

import DropzoneActividad from "@/components/dropzoneActividad";
import { formatearFechaColombiaParaInput } from "@/helpers/formatearFechaColombiaParaInput";
import NextPDFPreview from "@/components/pdfPreview";
import { ACTUALIZAR_TAREA } from "@/app/graphql/mutation/actualizarTarea";
import { OBTENER_TAREA } from "@/app/graphql/queries/obtenerTareaPorId";
import { formatearFecha } from "@/helpers/formatearFecha";

interface ArchivoTarea {
  url: string;
  nombre: string;
  tipo: string;
}

interface FormData {
  nombre: string;
  fechaEntrega: string;
  descripcion: string;
  estado: string;
  fotos: ArchivoTarea[];
  fotosNuevas?: ArchivoTarea[];
  pdfsNuevos?: ArchivoTarea[];
  fotosAConservar?: string[];
  pdfsAConservar?: string[];
  reemplazarFotos?: boolean;
  reemplazarPdfs?: boolean;
}

const esUrlExterna = (url: string): boolean => {
  return url.startsWith("https://") || url.startsWith("http://");
};

const esArchivoDescargable = (archivo: ArchivoTarea): boolean => {
  // Es descargable si es una URL externa y no es una imagen ni un PDF
  return esUrlExterna(archivo.url);
};

// Función auxiliar para determinar el tipo de archivo por la extensión o URL
const detectarTipoArchivo = (url: string): string => {
  if (!url) return "application/octet-stream";

  // Para data URIs - extraer el tipo directamente
  if (url.startsWith("data:")) {
    const match = url.match(/^data:([^;]+);/);

    if (match && match[1]) {
      return match[1];
    }

    // Si es data URI de imagen pero no se puede extraer el tipo exacto
    if (url.startsWith("data:image/")) {
      return "image/jpeg";
    }
  }

  // Para URLs normales - inferir por extensión o path
  if (url.toLowerCase().endsWith(".pdf") || url.includes("/PDFs/")) {
    return "application/pdf";
  } else if (
    url.toLowerCase().endsWith(".jpg") ||
    url.toLowerCase().endsWith(".jpeg")
  ) {
    return "image/jpeg";
  } else if (url.toLowerCase().endsWith(".png")) {
    return "image/png";
  } else if (url.toLowerCase().endsWith(".gif")) {
    return "image/gif";
  } else if (url.includes("/images/") || url.includes("/fotos/")) {
    return "image/jpeg"; // Asumimos JPEG por defecto para paths de imagen
  }

  // Por defecto, lo tratamos como archivo genérico
  return "application/octet-stream";
};

// Función para extraer el nombre de archivo de una URL o data URI
const extraerNombreArchivo = (url: string): string => {
  // Para data URIs, crear un nombre genérico que indique el tipo
  if (url.startsWith("data:")) {
    const tipo = detectarTipoArchivo(url);

    if (tipo.startsWith("image/")) {
      return `imagen_${new Date().getTime().toString().slice(-6)}.jpg`;
    } else if (tipo === "application/pdf") {
      return `documento_${new Date().getTime().toString().slice(-6)}.pdf`;
    }

    return `archivo_${new Date().getTime().toString().slice(-6)}`;
  }

  // Para URLs normales, extraer el nombre del archivo de la ruta
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/");
    const fileName = pathSegments[pathSegments.length - 1];

    // Si tiene un nombre de archivo válido
    if (fileName && fileName.length > 0 && fileName !== "/") {
      return decodeURIComponent(fileName);
    }
  } catch (e) {
    // Si no es una URL válida, intentamos extraer el último segmento después de /
    const segments = url.split("/");
    const lastSegment = segments[segments.length - 1];

    if (lastSegment && lastSegment.length > 0) {
      return lastSegment;
    }
  }

  // Si todo lo anterior falla
  return `archivo_${new Date().getTime().toString().slice(-6)}`;
};

// Función para convertir strings de URL a objetos de archivo
const convertirUrlAArchivo = (url: string): ArchivoTarea => {
  const tipo = detectarTipoArchivo(url);
  const nombre = extraerNombreArchivo(url);

  return { url, nombre, tipo };
};

export default function ActualizarTareaPage() {
  // Hooks y Estado
  const params = useParams();
  const router = useRouter();
  const grado_id = params.curso as string;
  const area_id = params.area as string;
  const tarea_id = params.tarea as string;

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    fechaEntrega: formatearFechaColombiaParaInput(new Date()),
    descripcion: "",
    estado: "",
    fotos: [],
    fotosNuevas: [],
    pdfsNuevos: [],
    fotosAConservar: [],
    pdfsAConservar: [],
    reemplazarFotos: false,
    reemplazarPdfs: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<ArchivoTarea[]>([]);

  // GraphQL Queries y Mutations
  const { data, loading: loadingTarea } = useQuery(OBTENER_TAREA, {
    variables: { id: tarea_id },
    onCompleted: (data) => {
      if (data?.obtenerTarea) {
        const tarea = data.obtenerTarea;

        const fechaOriginal = formatearFecha(tarea.fechaEntrega); // Ejemplo: "17/03/2025"
        const partes = fechaOriginal.split("/");
        const fechaFormateada = `${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`;
        // Convertir URLs a objetos de archivo con tipo
        const archivosExistentes: ArchivoTarea[] = [];

        // Procesar fotos (pueden ser URLs o data URIs)
        if (Array.isArray(tarea.fotos)) {
          tarea.fotos.forEach((url: string) => {
            archivosExistentes.push(convertirUrlAArchivo(url));
          });
        }

        // Procesar PDFs
        if (Array.isArray(tarea.pdfs)) {
          tarea.pdfs.forEach((url: string) => {
            archivosExistentes.push(convertirUrlAArchivo(url));
          });
        }

        // Extraer URLs para conservar
        const fotosURL = Array.isArray(tarea.fotos) ? tarea.fotos : [];
        const pdfsURL = Array.isArray(tarea.pdfs) ? tarea.pdfs : [];

        // Actualizar el estado con los datos de la tarea
        setFormData({
          nombre: tarea.nombre || "",
          fechaEntrega: fechaFormateada,
          descripcion: tarea.descripcion || "",
          estado: tarea.estado || "activa",
          fotos: archivosExistentes,
          fotosNuevas: [],
          pdfsNuevos: [],
          fotosAConservar: fotosURL,
          pdfsAConservar: pdfsURL,
          reemplazarFotos: false,
          reemplazarPdfs: false,
        });

        // Actualizar la lista de URLs
        setUploadedUrls(archivosExistentes);
      }
    },
    onError: (error) => {
      setError("Error al cargar la tarea: " + error.message);
      console.error("Error detallado:", error);
      // Mostrar toast de error
      toast.error(`Error al cargar la tarea: ${error.message}`, {
        duration: 4000,
      });
    },
  });

  const [actualizarTarea] = useMutation(ACTUALIZAR_TAREA, {
    refetchQueries: ["ObtenerTareasPorGradoYArea"],
    onCompleted: (data) => {
      // Mostrar toast de éxito
      toast.success(`¡Tarea "${formData.nombre}" actualizada correctamente!`, {
        duration: 4000,
      });
      router.back();
    },
    onError: (error) => {
      console.error("Error al actualizar la tarea:", error);
      setError(error.message);
      setLoading(false);
      // Mostrar toast de error
      toast.error(`Error al actualizar: ${error.message}`, {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  // Handlers
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value } = e.target;

      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleFileUpload = useCallback(
    (urls: string[], fileTypes: string[], fileNames: string[]) => {
      // Convertir las nuevas URLs a objetos de archivo con tipo
      const nuevosArchivos = urls.map((url, index) => ({
        url,
        tipo: fileTypes[index],
        nombre: fileNames[index],
      }));

      setUploadedUrls((prev) => [...prev, ...nuevosArchivos]);

      // Separar archivos nuevos por tipo (imagen o PDF)
      const nuevasFotos: ArchivoTarea[] = [];
      const nuevosPdfs: ArchivoTarea[] = [];

      nuevosArchivos.forEach((archivo) => {
        if (archivo.tipo === "application/pdf") {
          nuevosPdfs.push(archivo);
        } else {
          nuevasFotos.push(archivo);
        }
      });

      setFormData((prev) => ({
        ...prev,
        fotosNuevas: [...(prev.fotosNuevas || []), ...nuevasFotos],
        pdfsNuevos: [...(prev.pdfsNuevos || []), ...nuevosPdfs],
      }));

      // Mostrar toast de archivos subidos
      toast.success(`${nuevosArchivos.length} archivo(s) añadido(s)`, {
        duration: 2000,
        icon: "📂",
      });
    },
    [],
  );

  const removeFile = useCallback(
    (index: number) => {
      // Obtener el archivo que se va a eliminar
      const archivoAEliminar = uploadedUrls[index];

      // Eliminar de la lista de archivos mostrados
      setUploadedUrls((prev) => {
        const newUrls = [...prev];

        newUrls.splice(index, 1);

        return newUrls;
      });

      // Si es un archivo existente, eliminar de fotosAConservar o pdfsAConservar
      if (!archivoAEliminar.url.startsWith("data:")) {
        setFormData((prev) => {
          let nuevasFotosAConservar = [...(prev.fotosAConservar || [])];
          let nuevosPdfsAConservar = [...(prev.pdfsAConservar || [])];

          if (archivoAEliminar.tipo === "application/pdf") {
            nuevosPdfsAConservar = nuevosPdfsAConservar.filter(
              (url) => url !== archivoAEliminar.url,
            );
          } else {
            nuevasFotosAConservar = nuevasFotosAConservar.filter(
              (url) => url !== archivoAEliminar.url,
            );
          }

          return {
            ...prev,
            fotosAConservar: nuevasFotosAConservar,
            pdfsAConservar: nuevosPdfsAConservar,
          };
        });
      }

      // Si es un archivo nuevo, eliminar de fotosNuevas o pdfsNuevos
      if (archivoAEliminar.url.startsWith("data:")) {
        setFormData((prev) => {
          let nuevasFotosNuevas = [...(prev.fotosNuevas || [])];
          let nuevosPdfsNuevos = [...(prev.pdfsNuevos || [])];

          if (archivoAEliminar.tipo === "application/pdf") {
            nuevosPdfsNuevos = nuevosPdfsNuevos.filter(
              (a) => a.url !== archivoAEliminar.url,
            );
          } else {
            nuevasFotosNuevas = nuevasFotosNuevas.filter(
              (a) => a.url !== archivoAEliminar.url,
            );
          }

          return {
            ...prev,
            fotosNuevas: nuevasFotosNuevas,
            pdfsNuevos: nuevosPdfsNuevos,
          };
        });
      }

      // Mostrar toast de archivo eliminado
      toast.success(`Archivo eliminado`, {
        duration: 2000,
        icon: "🗑️",
      });

      // Limpiar advertencia si se elimina un archivo
      setError("");
    },
    [uploadedUrls],
  );

  const toggleReemplazarFotos = useCallback(() => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar todas las fotos e imágenes existentes?",
    );

    if (confirmar) {
      // Limpiar todos los archivos
      setUploadedUrls([]);

      setFormData((prev) => ({
        ...prev,
        fotosAConservar: [],
        pdfsAConservar: [],
        reemplazarFotos: true,
        reemplazarPdfs: true,
      }));

      // Mostrar toast de archivos eliminados
      toast("Todos los archivos han sido eliminados", {
        icon: "⚠️",
        duration: 3000,
        style: {
          background: "#FEF3C7",
          color: "#92400E",
        },
      });
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validación básica
    if (!formData.nombre.trim()) {
      setError("El nombre de la tarea es obligatorio");
      toast.error("El nombre de la tarea es obligatorio");

      return;
    }

    if (!formData.descripcion.trim()) {
      setError("La descripción es obligatoria");
      toast.error("La descripción es obligatoria");

      return;
    }

    if (!formData.fechaEntrega) {
      setError("La fecha de entrega es obligatoria");
      toast.error("La fecha de entrega es obligatoria");

      return;
    }

    if (!formData.estado) {
      setError("El estado de la tarea es obligatorio");
      toast.error("El estado de la tarea es obligatorio");

      return;
    }

    setLoading(true);
    setError("");

    // Preparar los datos para la mutación según el esquema GraphQL
    const fotosNuevasURLs = formData.fotosNuevas
      ? formData.fotosNuevas.map((archivo) => archivo.url)
      : [];
    const pdfsNuevosURLs = formData.pdfsNuevos
      ? formData.pdfsNuevos.map((archivo) => archivo.url)
      : [];

    try {
      // Mostrar toast de carga
      await actualizarTarea({
        variables: {
          id: tarea_id,
          input: {
            nombre: formData.nombre,
            fechaEntrega: formData.fechaEntrega,
            descripcion: formData.descripcion,
            estado: formData.estado,
            fotosNuevas: fotosNuevasURLs,
            pdfsNuevos: pdfsNuevosURLs,
            fotosAConservar: formData.fotosAConservar,
            pdfsAConservar: formData.pdfsAConservar,
            reemplazarFotos: formData.reemplazarFotos,
            reemplazarPdfs: formData.reemplazarPdfs,
            grado_id,
            area_id,
          },
        },
      });
    } catch (err) {
      console.error("Error en el submit:", err);
      setLoading(false);
      if (err instanceof Error) {
        setError(`Error al actualizar: ${err.message}`);

        // Actualizar toast de carga a error
        toast.error(`Error al actualizar: ${err.message}`, {
          id: "actualizar-tarea",
          duration: 5000,
        });
      }
    }
  }, [formData, tarea_id, grado_id, area_id, actualizarTarea]);

  // Estados derivados
  const maxRemainingImages = useMemo(
    () => 10 - uploadedUrls.length,
    [uploadedUrls.length],
  );
  const isMaxImagesReached = useMemo(
    () => uploadedUrls.length >= 10,
    [uploadedUrls.length],
  );

  if (loadingTarea) {
    return <div>Cargando datos de la tarea...</div>;
  }

  const renderizarArchivo = (
    archivo: { tipo: string; url: string; nombre: string },
    index: number,
    onRemove: any,
  ) => {
    // Determinar si es SVG basado en múltiples condiciones
    const esSVG =
      archivo.tipo === "image/svg+xml" ||
      archivo.url.toLowerCase().includes("svg") ||
      archivo.nombre.toLowerCase().includes("svg");

    // Determinar si es una imagen basado en el tipo o la URL
    const esImagen =
      archivo.tipo.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif"].some(
        (ext) =>
          archivo.url.toLowerCase().includes(ext) ||
          archivo.nombre.toLowerCase().includes(ext),
      );

    // Para archivos desconocidos, intentar renderizar como imagen si tiene patrones de imagen
    const intentarComoImagen =
      archivo.tipo === "application/octet-stream" &&
      (archivo.url.includes("/fotos/") ||
        archivo.url.includes("/images/") ||
        ["jpg", "jpeg", "png", "gif"].some(
          (ext) =>
            archivo.url.toLowerCase().includes(ext) ||
            archivo.nombre.toLowerCase().includes(ext),
        ));

    const urlCompleta = archivo.url.startsWith("https://")
      ? `${archivo.url}?${process.env.NEXT_PUBLIC_AZURE_KEY}`
      : archivo.url;

    // Renderizado según el tipo detectado
    if (archivo.tipo === "application/pdf") {
      return (
        <NextPDFPreview
          fileName={archivo.nombre}
          pdfUrl={archivo.url}
          onRemove={() => onRemove(index)}
        />
      );
    } else if (esSVG || esImagen || intentarComoImagen) {
      return (
        <div className="relative aspect-square">
          <Image
            alt={`Archivo ${index + 1}: ${archivo.nombre}`}
            className={`w-full h-full ${esSVG ? "object-contain p-2" : "object-cover"} rounded-t-lg`}
            src={urlCompleta}
            onError={(e: any) => {
              console.error(`Error al cargar imagen: ${archivo.url}`);
              e.target.src = "/placeholder-image.png"; // Imagen de reemplazo si falla
              e.target.className =
                "w-full h-full object-contain p-2 rounded-t-lg opacity-50";
            }}
          />
          <button
            aria-label="Eliminar archivo"
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
            onClick={() => onRemove(index)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
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
              clipRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              fillRule="evenodd"
            />
          </svg>
          <button
            aria-label="Eliminar archivo"
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
            onClick={() => onRemove(index)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl text-primary font-bold">Actualizar tarea</h1>
      </div>
      <div>
        {/* Mensaje de error o advertencia */}
        {error && (
          <div
            className={`px-4 py-3 rounded mb-4 ${
              error.startsWith("Advertencia:")
                ? "bg-amber-100 border border-amber-400 text-amber-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* Layout de grid: formulario a la izquierda (sticky), archivos a la derecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Columna izquierda: Formulario (sticky) */}
          <div className="md:sticky md:top-0 md:self-start space-y-4">
            {/* Nombre de la tarea */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="nombre"
              >
                Nombre de la tarea
              </label>
              <Input
                required
                id="nombre"
                name="nombre"
                placeholder="Ej: Ejercicios de matemáticas"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            {/* Fecha de entrega */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="fechaEntrega"
              >
                Fecha de entrega
              </label>
              <Input
                required
                id="fechaEntrega"
                name="fechaEntrega"
                type="date"
                value={formData.fechaEntrega}
                onChange={handleChange}
              />
            </div>

            {/* Estado de la tarea */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="estado"
              >
                Estado de la tarea
              </label>
              <Select
                required
                defaultSelectedKeys={[formData.estado]}
                id="estado"
                name="estado"
                placeholder="Seleccionar estado"
                selectedKeys={[formData.estado]}
                onSelectionChange={(keys) => {
                  // Convertir explícitamente a string para resolver el error de TypeScript
                  const selectedValue = String(Array.from(keys)[0] || "activa");

                  setFormData({
                    ...formData,
                    estado: selectedValue,
                  });
                }}
              >
                <SelectItem key="activa">Activa</SelectItem>
                <SelectItem key="vencida">Vencida</SelectItem>
                <SelectItem key="cancelada">Cancelada</SelectItem>
              </Select>
            </div>

            {/* Descripción */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="descripcion"
              >
                Descripción
              </label>
              <Textarea
                required
                id="descripcion"
                name="descripcion"
                placeholder="Describe la tarea..."
                rows={4}
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>

            {/* Carga de archivos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {uploadedUrls.length > 0
                  ? "Añadir más archivos"
                  : "Subir archivos"}
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
                  maxFiles={maxRemainingImages}
                  onFileUpload={handleFileUpload}
                />
              )}
            </div>

            {/* Botón para reemplazar todos los archivos */}
            <div className="mt-4">
              <Button
                className="w-full"
                color="danger"
                isDisabled={uploadedUrls.length === 0}
                variant="light"
                onPress={toggleReemplazarFotos}
              >
                Eliminar todos los archivos
              </Button>
            </div>
          </div>

          {/* Columna derecha: Vista previa de archivos (scrollable) */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">
              Archivos seleccionados ({uploadedUrls.length})
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
                          className="block"
                          href={`${archivo.url}?${process.env.NEXT_PUBLIC_AZURE_KEY}`}
                          rel="noopener noreferrer"
                          target="_blank"
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
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                              />
                            </svg>
                            Descargar archivo
                          </p>
                        </a>
                      ) : (
                        <>
                          <p
                            className="text-xs text-gray-500 truncate"
                            title={archivo.nombre}
                          >
                            {archivo.nombre.length > 18
                              ? `${archivo.nombre.substring(0, 15)}...`
                              : archivo.nombre}
                          </p>
                          <p className="text-xs text-gray-400">
                            {archivo.tipo === "image/svg+xml"
                              ? "SVG"
                              : archivo.tipo.startsWith("image/")
                                ? "Imagen"
                                : archivo.tipo === "application/pdf"
                                  ? "PDF"
                                  : archivo.url.includes("svg") ||
                                      archivo.nombre.includes("svg")
                                    ? "SVG"
                                    : "Archivo"}
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
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
      </div>
      <div className="flex justify-end gap-5">
        <Button
          color="danger"
          isDisabled={loading}
          variant="light"
          onPress={() => router.back()}
        >
          Cancelar
        </Button>
        <Button color="primary" isLoading={loading} onPress={handleSubmit}>
          {loading ? "Actualizando..." : "Actualizar tarea"}
        </Button>
      </div>
    </div>
  );
}
