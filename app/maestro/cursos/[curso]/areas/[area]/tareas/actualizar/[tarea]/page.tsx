"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useMutation, useQuery } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import DropzoneActividad from "@/components/dropzoneActividad";
import { formatearFechaColombiaParaInput } from "@/helpers/formatearFechaColombiaParaInput";
import NextPDFPreview from "@/components/pdfPreview";
import { ACTUALIZAR_TAREA } from "@/app/graphql/mutation/actualizarTarea";
import { OBTENER_TAREA } from "@/app/graphql/queries/obtenerTareaPorId";
import { toast } from 'react-hot-toast';

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

// Función para verificar si una cadena es una fecha válida en formato ISO
const isValidISODate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

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
    estado: "activa",
    fotos: [],
    fotosNuevas: [],
    pdfsNuevos: [],
    fotosAConservar: [],
    pdfsAConservar: [],
    reemplazarFotos: false,
    reemplazarPdfs: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<ArchivoTarea[]>([]);
  const [reemplazarFotos, setReemplazarFotos] = useState(false);
  const [reemplazarPdfs, setReemplazarPdfs] = useState(false);

  // GraphQL Queries y Mutations
  const { data, loading: loadingTarea } = useQuery(OBTENER_TAREA, {
    variables: { id: tarea_id },
    onCompleted: (data) => {
      if (data?.obtenerTarea) {
        const tarea = data.obtenerTarea;
        let fechaEntregaObj: Date;
        
        // Determinar cómo procesar la fecha según el formato recibido
        if (typeof tarea.fechaEntrega === 'string') {
          try {
            // Intentar convertir la fecha del formato recibido
            fechaEntregaObj = new Date(tarea.fechaEntrega);
          } catch (e) {
            console.error("Error al parsear fecha string:", e);
            fechaEntregaObj = new Date(); // Usar fecha actual como fallback
          }
        } else if (typeof tarea.fechaEntrega === 'number') {
          try {
            // Si es un timestamp (número)
            fechaEntregaObj = new Date(tarea.fechaEntrega);
          } catch (e) {
            console.error("Error al parsear fecha number:", e);
            fechaEntregaObj = new Date(); // Usar fecha actual como fallback
          }
        } else {
          // Fallback a fecha actual
          console.error("Formato de fecha no reconocido:", tarea.fechaEntrega);
          fechaEntregaObj = new Date();
        }

        // Formatear fecha para el input (YYYY-MM-DD)
        const year = fechaEntregaObj.getFullYear();
        const month = String(fechaEntregaObj.getMonth() + 1).padStart(2, '0');
        const day = String(fechaEntregaObj.getDate()).padStart(2, '0');
        const fechaFormateada = `${year}-${month}-${day}`;

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
          reemplazarPdfs: false
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
        duration: 4000
      });
    },
  });

  const [actualizarTarea] = useMutation(ACTUALIZAR_TAREA, {
    refetchQueries: ["ObtenerTareasPorGradoYArea"],
    onCompleted: (data) => {
      // Mostrar toast de éxito
      toast.success(`¡Tarea "${formData.nombre}" actualizada correctamente!`, {
        duration: 4000,
        position: 'top-center',
        icon: '✅'
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
        position: 'top-center'
      });
    },
  });

  // Handlers
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        nombre: fileNames[index]
      }));
      
      setUploadedUrls(prev => [...prev, ...nuevosArchivos]);
      
      // Separar archivos nuevos por tipo (imagen o PDF)
      const nuevasFotos: ArchivoTarea[] = [];
      const nuevosPdfs: ArchivoTarea[] = [];
      
      nuevosArchivos.forEach(archivo => {
        if (archivo.tipo === 'application/pdf') {
          nuevosPdfs.push(archivo);
        } else {
          nuevasFotos.push(archivo);
        }
      });
      
      setFormData(prev => ({
        ...prev,
        fotosNuevas: [...(prev.fotosNuevas || []), ...nuevasFotos],
        pdfsNuevos: [...(prev.pdfsNuevos || []), ...nuevosPdfs]
      }));
      
      // Mostrar toast de archivos subidos
      toast.success(`${nuevosArchivos.length} archivo(s) añadido(s)`, {
        duration: 2000,
        icon: '📂'
      });
    },
    [],
  );

  const removeFile = useCallback((index: number) => {
    // Obtener el archivo que se va a eliminar
    const archivoAEliminar = uploadedUrls[index];
    
    // Eliminar de la lista de archivos mostrados
    setUploadedUrls(prev => {
      const newUrls = [...prev];
      newUrls.splice(index, 1);
      return newUrls;
    });

    // Si es un archivo existente, eliminar de fotosAConservar o pdfsAConservar
    if (!archivoAEliminar.url.startsWith('data:')) {
      setFormData(prev => {
        let nuevasFotosAConservar = [...(prev.fotosAConservar || [])];
        let nuevosPdfsAConservar = [...(prev.pdfsAConservar || [])];
        
        if (archivoAEliminar.tipo === 'application/pdf') {
          nuevosPdfsAConservar = nuevosPdfsAConservar.filter(url => url !== archivoAEliminar.url);
        } else {
          nuevasFotosAConservar = nuevasFotosAConservar.filter(url => url !== archivoAEliminar.url);
        }
        
        return {
          ...prev,
          fotosAConservar: nuevasFotosAConservar,
          pdfsAConservar: nuevosPdfsAConservar
        };
      });
    }

    // Si es un archivo nuevo, eliminar de fotosNuevas o pdfsNuevos
    if (archivoAEliminar.url.startsWith('data:')) {
      setFormData(prev => {
        let nuevasFotosNuevas = [...(prev.fotosNuevas || [])];
        let nuevosPdfsNuevos = [...(prev.pdfsNuevos || [])];
        
        if (archivoAEliminar.tipo === 'application/pdf') {
          nuevosPdfsNuevos = nuevosPdfsNuevos.filter(a => a.url !== archivoAEliminar.url);
        } else {
          nuevasFotosNuevas = nuevasFotosNuevas.filter(a => a.url !== archivoAEliminar.url);
        }
        
        return {
          ...prev,
          fotosNuevas: nuevasFotosNuevas,
          pdfsNuevos: nuevosPdfsNuevos
        };
      });
    }

    // Mostrar toast de archivo eliminado
    toast.success(`Archivo eliminado`, {
      duration: 2000,
      icon: '🗑️'
    });

    // Limpiar advertencia si se elimina un archivo
    setError("");
  }, [uploadedUrls]);

  const toggleReemplazarFotos = useCallback(() => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar todas las fotos e imágenes existentes?",
    );
    if (confirmar) {
      setReemplazarFotos(true);
      setReemplazarPdfs(true);
      
      // Limpiar todos los archivos
      setUploadedUrls([]);
      
      setFormData(prev => ({ 
        ...prev, 
        fotosAConservar: [],
        pdfsAConservar: [],
        reemplazarFotos: true,
        reemplazarPdfs: true
      }));
      
      // Mostrar toast de archivos eliminados
      toast('Todos los archivos han sido eliminados', {
        icon: '⚠️',
        duration: 3000,
        style: {
          background: '#FEF3C7',
          color: '#92400E'
        }
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

    // Asegurar que la fecha tenga formato YYYY-MM-DD
    const fechaActual = new Date();
    let fechaFormateada = formData.fechaEntrega;
    
    // Si la fecha no es válida o está en formato incorrecto, usar la fecha actual
    if (!fechaFormateada || !isValidISODate(fechaFormateada)) {
      const year = fechaActual.getFullYear();
      const month = String(fechaActual.getMonth() + 1).padStart(2, '0');
      const day = String(fechaActual.getDate()).padStart(2, '0');
      fechaFormateada = `${year}-${month}-${day}`;
    }

    // Preparar los datos para la mutación según el esquema GraphQL
    const fotosNuevasURLs = formData.fotosNuevas ? formData.fotosNuevas.map(archivo => archivo.url) : [];
    const pdfsNuevosURLs = formData.pdfsNuevos ? formData.pdfsNuevos.map(archivo => archivo.url) : [];

    try {
      // Mostrar toast de carga
      toast.loading("Actualizando tarea...", { id: "actualizar-tarea" });
      
      await actualizarTarea({
        variables: {
          id: tarea_id,
          input: {
            nombre: formData.nombre,
            fechaEntrega: fechaFormateada,
            descripcion: formData.descripcion,
            estado: formData.estado,
            fotosNuevas: fotosNuevasURLs,
            pdfsNuevos: pdfsNuevosURLs,
            fotosAConservar: formData.fotosAConservar,
            pdfsAConservar: formData.pdfsAConservar,
            reemplazarFotos: formData.reemplazarFotos,
            reemplazarPdfs: formData.reemplazarPdfs,
            grado_id,
            area_id
          },
        },
      });
      
      // Actualizar toast de carga a éxito
      toast.success(`¡Tarea "${formData.nombre}" actualizada correctamente!`, {
        id: "actualizar-tarea",
        duration: 4000
      });
    } catch (err) {
      console.error("Error en el submit:", err);
      setLoading(false);
      if (err instanceof Error) {
        setError(`Error al actualizar: ${err.message}`);
        
        // Actualizar toast de carga a error
        toast.error(`Error al actualizar: ${err.message}`, {
          id: "actualizar-tarea",
          duration: 5000
        });
      }
    }
  }, [
    formData,
    tarea_id,
    grado_id,
    area_id,
    actualizarTarea,
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

  if (loadingTarea) {
    return <div>Cargando datos de la tarea...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl text-primary font-bold">Actualizar tarea</h1>
      </div>
      <div>
        {/* Mensaje de error o advertencia */}
        {error && (
          <div className={`px-4 py-3 rounded mb-4 ${error.startsWith('Advertencia:')
            ? 'bg-amber-100 border border-amber-400 text-amber-700'
            : 'bg-red-100 border border-red-400 text-red-700'}`}>
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
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de la tarea
              </label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Ejercicios de matemáticas"
                required
              />
            </div>

            {/* Fecha de entrega */}
            <div>
              <label
                htmlFor="fechaEntrega"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha de entrega
              </label>
              <Input
                type="date"
                id="fechaEntrega"
                name="fechaEntrega"
                value={formData.fechaEntrega}
                onChange={handleChange}
                required
              />
            </div>

            {/* Estado de la tarea */}
            <div>
              <label
                htmlFor="estado"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estado de la tarea
              </label>
              <Select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                placeholder="Seleccionar estado"
                required
              >
                <SelectItem key="activa" value="activa">
                  Activa
                </SelectItem>
                <SelectItem key="vencida" value="vencida">
                  Vencida
                </SelectItem>
                <SelectItem key="cancelada" value="cancelada">
                  Cancelada
                </SelectItem>
              </Select>
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
                placeholder="Describe la tarea..."
                required
              />
            </div>

            {/* Carga de archivos */}
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

          {/* Columna derecha: Vista previa de archivos (scrollable) */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">
              Archivos seleccionados ({uploadedUrls.length})
            </h3>

            {uploadedUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pr-2">
                {uploadedUrls.map((file, index) => (
                  <div
                    key={index}
                    className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {file.tipo === 'application/pdf' ? (
                      <NextPDFPreview
                        pdfUrl={file.url}
                        fileName={file.nombre}
                        onRemove={() => removeFile(index)}
                      />
                    ) : file.tipo.startsWith('image/') ? (
                      <div className="relative aspect-square">
                        <img
                          src={file.url}
                          alt={`Imagen ${index + 1}: ${file.nombre}`}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                        <button
                          onClick={() => removeFile(index)}
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
                    ) : (
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
                          onClick={() => removeFile(index)}
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
                    )}
                    <div className="p-2 bg-gray-50 rounded-b-lg">
                      <p className="text-xs text-gray-500 truncate" title={file.nombre}>
                        {file.nombre.length > 18 ? `${file.nombre.substring(0, 15)}...` : file.nombre}
                      </p>
                      <p className="text-xs text-gray-400">
                        {file.tipo.startsWith('image/') ? 'Imagen' : 'PDF'}
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
          variant="light"
          onPress={() => router.back()}
          isDisabled={loading}
        >
          Cancelar
        </Button>
        <Button color="primary" onPress={handleSubmit} isLoading={loading}>
          {loading ? "Actualizando..." : "Actualizar tarea"}
        </Button>
      </div>
    </div>
  );
}