"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";

interface DropzoneActividadProps {
  onFileUpload: (urls: string[], fileTypes: string[], fileNames: string[]) => void;
  maxFiles?: number;
}

const DropzoneActividad: React.FC<DropzoneActividadProps> = ({
  onFileUpload,
  maxFiles = 10,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Esta función se ejecuta cuando se seleccionan archivos
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Validar tamaño y tipo de archivo
      const validFiles = acceptedFiles.filter((file) => {
        const isValidType = file.type.startsWith("image/") || file.type === "application/pdf";
        const isUnderSizeLimit = file.size <= 5 * 1024 * 1024; // 5MB
        return isValidType && isUnderSizeLimit;
      });

      if (validFiles.length !== acceptedFiles.length) {
        setUploadError(
          "Algunos archivos fueron rechazados. Solo se permiten imágenes y PDFs de hasta 5MB.",
        );
      }

      // Actualizar la lista de archivos
      const newFiles = [...files, ...validFiles].slice(0, maxFiles);
      setFiles(newFiles);

      try {
        setUploading(true);
        setUploadError("");

        // Simular la subida de archivos y obtener URLs
        const urlsAndData = await Promise.all(
          newFiles.map(
            (file) =>
              new Promise<{url: string, type: string, name: string}>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  // En producción, aquí recibirías la URL del servidor después de subir el archivo
                  resolve({
                    url: reader.result as string,
                    type: file.type,
                    name: file.name
                  });
                };
                reader.readAsDataURL(file);
              }),
          ),
        );

        // Separar URLs, tipos y nombres de archivo para pasar al componente padre
        const urls = urlsAndData.map(item => item.url);
        const fileTypes = urlsAndData.map(item => item.type);
        const fileNames = urlsAndData.map(item => item.name);

        // Notificar al componente padre sobre las URLs generadas, tipos y nombres de archivo
        onFileUpload(urls, fileTypes, fileNames);
        setUploading(false);
      } catch (error) {
        console.error("Error al subir los archivos:", error);
        setUploadError(
          "Error al subir los archivos. Por favor, inténtalo de nuevo.",
        );
        setUploading(false);
      }
    },
    [files, maxFiles, onFileUpload],
  );

  // Configuración del dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpg", ".jpeg", ".png", ".gif"],
        "application/pdf": [".pdf"]
      },
      maxFiles,
      maxSize: 5 * 1024 * 1024, // 5MB
    });

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div
            {...getRootProps()}
            className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : isDragReject
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-2">
              {uploading ? (
                <Spinner color="primary" />
              ) : (
                <>
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-gray-600">
                    {isDragActive
                      ? "Suelta las imágenes o PDFs aquí..."
                      : "Arrastra y suelta imágenes o PDFs aquí, o haz clic para seleccionar"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Sube hasta {maxFiles} archivos (imágenes o PDFs, máximo 5MB cada uno)
                  </p>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Mensaje de error */}
      {uploadError && <div className="text-red-500 text-sm">{uploadError}</div>}
    </div>
  );
};

export default DropzoneActividad;