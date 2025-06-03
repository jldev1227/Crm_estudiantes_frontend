"use client";
import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { useMutation } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";

import DropzoneActividad from "@/components/dropzoneActividad";
import { formatearFechaColombiaParaInput } from "@/helpers/formatearFechaColombiaParaInput";
import NextPDFPreview from "@/components/pdfPreview";
import { CREAR_TAREA } from "@/app/graphql/mutation/crearTarea";

interface FormData {
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  archivos: {
    url: string;
    tipo: string;
    nombre: string;
  }[];
}

export default function CrearTareaPage() {
  const params = useParams();
  const grado_id = params.curso as string;
  const area_id = params.area as string;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<
    { url: string; tipo: string; nombre: string }[]
  >([]);

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descripcion: "",
    fechaEntrega: formatearFechaColombiaParaInput(new Date()),
    archivos: [],
  });

  // Mutación para crear tarea
  const [crearTarea] = useMutation(CREAR_TAREA, {
    refetchQueries: ["ObtenerTareas"], // Refresca la lista de tareas después de crear una nueva
    onCompleted: (data) => {
      // Mostrar toast de confirmación
      toast.success(`¡Tarea "${formData.titulo}" creada con éxito!`, {
        duration: 4000,
      });

      // Resetear el formulario y redirigir
      setFormData({
        titulo: "",
        descripcion: "",
        fechaEntrega: formatearFechaColombiaParaInput(new Date()),
        archivos: [],
      });
      setUploadedFiles([]);
      setLoading(false);
      router.back();
    },
    onError: (error) => {
      console.error("Error al crear la tarea:", error);
      setError(error.message);
      setLoading(false);

      // Mostrar toast de error
      toast.error(`Error: ${error.message}`, {
        duration: 5000,
        position: "top-center",
      });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Esta función recibe las URLs, tipos y nombres de los archivos después de subirse
  const handleFileUpload = (
    urls: string[],
    fileTypes: string[],
    fileNames: string[],
  ) => {
    const files = urls.map((url, index) => ({
      url,
      tipo: fileTypes[index],
      nombre: fileNames[index],
    }));

    setUploadedFiles(files);
    setFormData((prev) => ({ ...prev, archivos: files }));

    // Mostrar advertencia si solo hay PDFs
    const soloTienePdfs =
      files.length > 0 &&
      files.every((file) => file.tipo === "application/pdf");

    if (soloTienePdfs) {
      setError(
        "Advertencia: Has subido solo PDFs. Para una mejor experiencia, te recomendamos incluir al menos una imagen.",
      );
    } else {
      setError("");
    }
  };

  // Eliminar un archivo específico
  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];

    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    setFormData((prev) => ({ ...prev, archivos: newFiles }));

    // Actualizar advertencia si solo quedan PDFs
    const soloTienePdfs =
      newFiles.length > 0 &&
      newFiles.every((file) => file.tipo === "application/pdf");

    if (soloTienePdfs) {
      setError(
        "Advertencia: Has subido solo PDFs. Para una mejor experiencia, te recomendamos incluir al menos una imagen.",
      );
    } else {
      setError("");
    }
  };

  const handleSubmit = async () => {
    // Validación básica
    if (!formData.titulo.trim()) {
      setError("El título de la tarea es obligatorio");
      toast.error("El título de la tarea es obligatorio");

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

    setLoading(true);
    setError("");

    try {
      // Separar imágenes y PDFs
      const imageFiles = formData.archivos
        .filter((archivo) => archivo.tipo.startsWith("image/"))
        .map((archivo) => archivo.url);

      const pdfFiles = formData.archivos
        .filter((archivo) => archivo.tipo === "application/pdf")
        .map((archivo) => archivo.url);

      // Variables para la mutación
      const variables = {
        input: {
          nombre: formData.titulo,
          fechaEntrega: formData.fechaEntrega,
          descripcion: formData.descripcion,
          fotos: imageFiles,
          pdfs: pdfFiles,
          grado_id,
          area_id,
        },
      };

      await crearTarea({ variables });
    } catch (err: any) {
      console.error("Error al crear la tarea:", err);
      setError(err.message || "Ocurrió un error al crear la tarea");

      // Actualizar toast de carga a error
      toast.error(
        `Error: ${err.message || "Ocurrió un error al crear la tarea"}`,
        {
          id: "crear-tarea",
          duration: 5000,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl text-primary font-bold">Crear nueva tarea</h1>
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
            {/* Título de la tarea */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="titulo"
              >
                Título de la tarea
              </label>
              <Input
                required
                id="titulo"
                name="titulo"
                placeholder="Ej: Taller de problemas matemáticos"
                value={formData.titulo}
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

            {/* Descripción */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="descripcion"
              >
                Descripción e instrucciones
              </label>
              <Textarea
                required
                id="descripcion"
                name="descripcion"
                placeholder="Describe en detalle la tarea y los requisitos para su entrega..."
                rows={4}
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>

            {/* Carga de archivos */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="drop_files"
              >
                Archivos de apoyo
              </label>
              <DropzoneActividad onFileUpload={handleFileUpload} />
              <p className="text-xs text-gray-500 mt-1">
                Puedes subir imágenes y PDFs como material de apoyo para la
                tarea.
              </p>
            </div>
          </div>

          {/* Columna derecha: Vista previa de archivos (scrollable) */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">
              Archivos seleccionados ({uploadedFiles.length})
            </h3>

            {uploadedFiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pr-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {file.tipo === "application/pdf" ? (
                      <NextPDFPreview
                        fileName={file.nombre}
                        pdfUrl={file.url}
                        onRemove={() => removeFile(index)}
                      />
                    ) : file.tipo.startsWith("image/") ? (
                      <div className="relative aspect-square">
                        <Image
                          alt={`Imagen ${index + 1}: ${file.nombre}`}
                          className="w-full h-full object-cover rounded-t-lg"
                          src={file.url}
                        />
                        <button
                          aria-label="Eliminar archivo"
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                          onClick={() => removeFile(index)}
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
                    ) : (
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
                          onClick={() => removeFile(index)}
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
                    )}
                    <div className="p-2 bg-gray-50 rounded-b-lg">
                      <p
                        className="text-xs text-gray-500 truncate"
                        title={file.nombre}
                      >
                        {file.nombre.length > 18
                          ? `${file.nombre.substring(0, 15)}...`
                          : file.nombre}
                      </p>
                      <p className="text-xs text-gray-400">
                        {file.tipo.startsWith("image/") ? "Imagen" : "PDF"}
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
                  Los archivos de apoyo aparecerán aquí cuando los subas
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
          {loading ? "Creando..." : "Crear tarea"}
        </Button>
      </div>
    </div>
  );
}
