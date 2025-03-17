"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Realizar logout inmediatamente
    logout();

    // Variable para rastrear si el componente está montado
    let isMounted = true;
    
    // Configurar la cuenta regresiva
    const timer = setInterval(() => {
      if (isMounted) {
        setCountdown((prevCount) => {
          const newCount = prevCount - 1;
          
          // Si la cuenta llegó a 0, limpiamos el intervalo
          // Pero NO hacemos la redirección aquí
          if (newCount <= 0 && isMounted) {
            clearInterval(timer);
          }
          
          return newCount;
        });
      }
    }, 1000);

    // Configurar un timeout independiente para la redirección
    const redirectTimeout = setTimeout(() => {
      if (isMounted) {
        // Usar un setTimeout para la redirección para evitar conflictos durante el renderizado
        router.push("/ingreso");
      }
    }, 3000); // 3 segundos (coincide con el contador)

    // Limpieza al desmontar el componente
    return () => {
      isMounted = false;
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, []); // Ejecutar solo una vez al montar

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Sesión cerrada
        </h1>

        <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>

        <p className="text-gray-600">Has cerrado sesión correctamente.</p>
        <p className="text-gray-500 text-sm mt-2">
          Redirigiendo en {countdown > 0 ? countdown : 0} segundos...
        </p>
      </div>
    </div>
  );
}