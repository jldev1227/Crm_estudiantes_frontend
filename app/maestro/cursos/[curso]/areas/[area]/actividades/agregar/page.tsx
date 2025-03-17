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
import PDFPreview from "@/components/pdfPreview";
import ReactPDFPreview from "@/components/pdfPreview";
import NextPDFPreview from "@/components/pdfPreview";
import toast from "react-hot-toast";

interface FormData {
  nombre: string;
  fecha: string;
  hora: string;
  descripcion: string;
  archivos: {
    url: string;
    tipo: string;
    nombre: string;
  }[];
}

export default function Page() {
  const params = useParams();
  const grado_id = params.curso as string;
  const area_id = params.area as string;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; tipo: string; nombre: string }[]>([]);

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    fecha: formatearFechaColombiaParaInput(new Date()),
    hora: "",
    descripcion: "",
    archivos: [],
  });

  // Mutación para crear actividad
  const [crearActividad] = useMutation(CREAR_ACTIVIDAD, {
    refetchQueries: ["ObtenerActividades"], // Refresca la lista de actividades después de crear una nueva
    onCompleted: () => {
      // Resetear el formulario y cerrar el modal al completar
      toast.success(`Actividad "${formData.nombre}" creada con éxito!`, {
        duration: 4000,
        position: 'top-center',
        icon: '✅',
      });

      setFormData({
        nombre: "",
        fecha: formatearFechaColombiaParaInput(new Date()),
        hora: "",
        descripcion: "",
        archivos: [],
      });
      setUploadedFiles([]);
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

  // Esta función recibe las URLs, tipos y nombres de los archivos después de subirse
  const handleFileUpload = (urls: string[], fileTypes: string[], fileNames: string[]) => {
    const files = urls.map((url, index) => ({
      url,
      tipo: fileTypes[index],
      nombre: fileNames[index]
    }));

    setUploadedFiles(files);
    setFormData((prev) => ({ ...prev, archivos: files }));

    // Mostrar advertencia si solo hay PDFs
    const soloTienePdfs = files.length > 0 && files.every(file => file.tipo === 'application/pdf');
    if (soloTienePdfs) {
      setError("Advertencia: Has subido solo PDFs. Para una mejor experiencia, te recomendamos incluir al menos una imagen.");
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
    const soloTienePdfs = newFiles.length > 0 && newFiles.every(file => file.tipo === 'application/pdf');
    if (soloTienePdfs) {
      setError("Advertencia: Has subido solo PDFs. Para una mejor experiencia, te recomendamos incluir al menos una imagen.");
    } else {
      setError("");
    }
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

    if (uploadedFiles.length === 0) {
      setError("Debes subir al menos un archivo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Separar imágenes y PDFs
      const imageFiles = formData.archivos
        .filter(archivo => archivo.tipo.startsWith('image/'))
        .map(archivo => archivo.url);

      const pdfFiles = formData.archivos
        .filter(archivo => archivo.tipo === 'application/pdf')
        .map(archivo => archivo.url);

      // Si tenemos PDFs, añadir información sobre ellos en la descripción
      let descripcionActualizada = formData.descripcion;

      // Variables para la mutación
      const variables = {
        input: {
          nombre: formData.nombre,
          fecha: formData.fecha,
          hora: formData.hora || "", // Asegurarnos de que hora esté definida
          descripcion: descripcionActualizada,
          fotos: imageFiles, // Enviar todas las URLs en fotos
          pdfs: pdfFiles,
          grado_id,
          area_id,
        }
      };

      await crearActividad({ variables });
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

            {/* hora */}
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

            {/* Carga de archivos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Archivos de la actividad
              </label>
              <DropzoneActividad onFileUpload={handleFileUpload} />
              <p className="text-xs text-gray-500 mt-1">
                Puedes subir imágenes y PDFs. Ambos tipos aparecerán en la actividad.
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
          {loading ? "Creando..." : "Crear actividad"}
        </Button>
      </div>
    </div>
  );
}

