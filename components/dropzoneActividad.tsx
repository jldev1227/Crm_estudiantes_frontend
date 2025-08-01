"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";

interface DropzoneActividadProps {
  onFileUpload: (
    urls: string[],
    fileTypes: string[],
    fileNames: string[],
  ) => void;
  maxFiles?: number;
  filesCount?: number; // Contador de archivos ya subidos
}

const DropzoneActividad: React.FC<DropzoneActividadProps> = ({
  onFileUpload,
  maxFiles = 10,
  filesCount = 0, // Por defecto asumimos que no hay archivos
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Esta función se ejecuta cuando se seleccionan archivos
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Validar tamaño y tipo de archivo
      const validFiles = acceptedFiles.filter((file) => {
        const isValidType =
          file.type.startsWith("image/") || file.type === "application/pdf";
        const isUnderSizeLimit = file.size <= 5 * 1024 * 1024; // 5MB

        return isValidType && isUnderSizeLimit;
      });

      if (validFiles.length !== acceptedFiles.length) {
        setUploadError(
          "Algunos archivos fueron rechazados. Solo se permiten imágenes y PDFs de hasta 5MB.",
        );
      }

      // Calcular cuántos archivos nuevos podemos añadir sin sobrepasar el límite
      const spaceLeft = maxFiles - filesCount;

      // Actualizar la lista de archivos, considerando el límite
      const newFiles = validFiles.slice(0, spaceLeft);

      if (newFiles.length === 0) {
        setUploadError("Has alcanzado el límite máximo de archivos.");

        return;
      }

      try {
        setUploading(true);
        setUploadError("");

        // Procesar archivos nuevos para obtener URLs, tipos y nombres
        const urlsAndData = await Promise.all(
          newFiles.map(
            (file) =>
              new Promise<{ url: string; type: string; name: string }>(
                (resolve) => {
                  const reader = new FileReader();

                  reader.onloadend = () => {
                    resolve({
                      url: reader.result as string,
                      type: file.type,
                      name: file.name,
                    });
                  };
                  reader.readAsDataURL(file);
                },
              ),
          ),
        );

        // Separar URLs, tipos y nombres para pasar al componente padre
        const urls = urlsAndData.map((item) => item.url);
        const fileTypes = urlsAndData.map((item) => item.type);
        const fileNames = urlsAndData.map((item) => item.name);

        // Notificar al componente padre
        onFileUpload(urls, fileTypes, fileNames);
        setUploading(false);
      } catch (error) {
        console.error("Error al procesar los archivos:", error);
        setUploadError(
          "Error al procesar los archivos. Por favor, inténtalo de nuevo.",
        );
        setUploading(false);
      }
    },
    [filesCount, maxFiles, onFileUpload],
  );

  // Calcular el número máximo de archivos que se pueden añadir
  const remainingFiles = maxFiles - filesCount;

  // Configuración del dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpg", ".jpeg", ".png", ".gif"],
        "application/pdf": [".pdf"],
      },
      maxFiles: remainingFiles > 0 ? remainingFiles : 1,
      maxSize: 10 * 1024 * 1024, // 10MB
      disabled: remainingFiles <= 0,
    });

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div
            {...getRootProps()}
            className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
              remainingFiles <= 0
                ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                : isDragActive
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  {remainingFiles <= 0 ? (
                    <p className="text-gray-500">
                      Has alcanzado el límite máximo de {maxFiles} archivos
                    </p>
                  ) : isDragActive ? (
                    <p className="text-gray-600">
                      Suelta las imágenes o PDFs aquí...
                    </p>
                  ) : (
                    <>
                      <p className="text-gray-600">
                        Arrastra y suelta imágenes o PDFs aquí, o haz clic para
                        seleccionar
                      </p>
                      <p className="text-xs text-gray-500">
                        Puedes subir {remainingFiles} archivo(s) más (imágenes o
                        PDFs, máximo 5MB cada uno)
                      </p>
                    </>
                  )}
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
