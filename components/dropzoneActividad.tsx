"use client";
;

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";

interface DropzoneActividadProps {
  onFileUpload: (urls: string[]) => void;
  maxFiles?: number;
}

const DropzoneActividad: React.FC<DropzoneActividadProps> = ({
  onFileUpload,
  maxFiles = 10,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Esta función se ejecuta cuando se seleccionan archivos
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Validar tamaño y tipo de archivo
      const validFiles = acceptedFiles.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isUnderSizeLimit = file.size <= 5 * 1024 * 1024; // 5MB
        return isImage && isUnderSizeLimit;
      });

      if (validFiles.length !== acceptedFiles.length) {
        setUploadError('Algunos archivos fueron rechazados. Solo se permiten imágenes de hasta 5MB.');
      }

      // Actualizar la lista de archivos
      const newFiles = [...files, ...validFiles].slice(0, maxFiles);
      setFiles(newFiles);

      // Simular la subida de archivos (en producción, esto se conectaría a tu API)
      try {
        setUploading(true);
        setUploadError('');
        
        // En un caso real, aquí subirías los archivos a tu servidor o a un servicio como Cloudinary
        // y recibirías URLs. Para este ejemplo, simulamos URLs generadas.
        
        // Simulación: convertir los archivos a URLs de datos (data URLs)
        const urls = await Promise.all(
          newFiles.map((file) => 
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                // En producción, aquí recibirías la URL del servidor después de subir el archivo
                resolve(reader.result as string);
              };
              reader.readAsDataURL(file);
            })
          )
        );
        
        // Notificar al componente padre sobre las URLs generadas
        onFileUpload(urls);
        setUploading(false);
      } catch (error) {
        console.error('Error al subir los archivos:', error);
        setUploadError('Error al subir los archivos. Por favor, inténtalo de nuevo.');
        setUploading(false);
      }
    },
    [files, maxFiles, onFileUpload]
  );

  // Configuración del dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
    },
    maxFiles,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  // Eliminar un archivo
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    // Actualizar las URLs (en producción, también deberías eliminar el archivo del servidor)
    if (files.length > 0) {
      // Actualizar las URLs al eliminar un archivo
      // Esto es una simulación, en producción necesitarías recalcular las URLs reales
      Promise.all(
        newFiles.map((file) => 
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(file);
          })
        )
      ).then(urls => {
        onFileUpload(urls);
      });
    } else {
      onFileUpload([]);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div
            {...getRootProps()}
            className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : isDragReject 
                  ? 'border-red-400 bg-red-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
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
                      ? 'Suelta las imágenes aquí...'
                      : 'Arrastra y suelta imágenes aquí, o haz clic para seleccionar'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Sube hasta {maxFiles} imágenes (máximo 5MB cada una)
                  </p>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Mensaje de error */}
      {uploadError && (
        <div className="text-red-500 text-sm">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default DropzoneActividad;