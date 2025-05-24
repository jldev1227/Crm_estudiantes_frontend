"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles = []
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const { usuario, estaCargando, logout } = useAuth();

  useEffect(() => {
    // Si aún está cargando, esperar
    if (estaCargando) {
      return;
    }

    // Verificar si hay token
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/ingreso");
      return;
    }

    // Si no hay usuario después de cargar, significa que hubo error de autenticación
    if (!usuario) {
      console.error("No se pudo obtener datos del usuario");
      logout();
      toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
      router.push("/ingreso");
      return;
    }

    // Verificar roles si están especificados
    if (allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.includes(usuario.rol);

      if (!hasAllowedRole) {
        // Redirigir según el rol del usuario
        switch (usuario.rol) {
          case 'maestro':
            router.push("/maestro");
            break;
          case 'estudiante':
            router.push("/estudiante");
            break;
          case 'admin':
            router.push("/admin");
            break;
          default:
            router.push("/ingreso");
        }
        return;
      }

      setIsAuthorized(hasAllowedRole);
    } else {
      // Si no hay roles especificados, autorizar si hay usuario válido
      setIsAuthorized(true);
    }
  }, [usuario, estaCargando, allowedRoles, router, logout]);

  // Usar el loading del AuthContext
  if (estaCargando) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autorizado, no renderizar nada (las redirecciones ya se manejan arriba)
  if (!isAuthorized) {
    return null;
  }

  // Renderizar contenido protegido
  return <>{children}</>;
}