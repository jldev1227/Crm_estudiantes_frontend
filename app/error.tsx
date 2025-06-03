"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log del error para depuración
    console.error("Error capturado:", error);
  }, [error]);

  // Verificar si es un error de pensión inactiva
  const isPensionError =
    error.message === "Pensión inactiva" ||
    error.message.toLowerCase().includes("pensión");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div
            className={`${isPensionError ? "bg-amber-100" : "bg-red-100"} p-3 rounded-full`}
          >
            {isPensionError ? (
              <svg
                className="h-8 w-8 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ) : (
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            )}
          </div>
        </div>

        <h2
          className={`text-2xl font-bold text-center ${isPensionError ? "text-amber-800" : "text-gray-800"} mb-4`}
        >
          {isPensionError ? "Acceso Restringido" : "Error Inesperado"}
        </h2>

        <p className="text-gray-600 mb-6 text-center">
          {isPensionError ? (
            <>
              <span className="font-medium">No puedes acceder al sistema.</span>
              <span className="block mt-2">
                Tu pensión escolar no se encuentra activa. Por favor, contacta
                con el departamento administrativo para regularizar tu
                situación.
              </span>
            </>
          ) : (
            <>
              Lo sentimos, ha ocurrido un error inesperado.
              {error?.digest && (
                <span className="block mt-2 text-sm text-gray-500">
                  Referencia: {error.digest}
                </span>
              )}
            </>
          )}
        </p>

        <div className="flex flex-col space-y-3">
          {isPensionError ? (
            <>
              <button
                className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition duration-200"
                onClick={() => router.push("/contacto-administracion")}
              >
                Contactar Administración
              </button>

              <button
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition duration-200"
                onClick={() => router.push("/ingreso")}
              >
                Volver al Inicio de Sesión
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
                onClick={() => reset()}
              >
                Intentar Nuevamente
              </button>

              <button
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition duration-200"
                onClick={() => router.push("/")}
              >
                Volver al Inicio
              </button>
            </>
          )}
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">
              Información de desarrollo:
            </p>
            <div className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">
              <p>
                <strong>Mensaje:</strong> {error.message}
              </p>
              {error.stack && (
                <p className="mt-1">
                  <strong>Origen:</strong> {error.stack.split("\n")[1]?.trim()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
