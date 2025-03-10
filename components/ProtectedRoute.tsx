"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import LoaderIngreso from "./loaderIngreso";

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
  const { usuario } = useAuth();

  useEffect(() => {
    // Verificar token de autenticación
    const token = localStorage.getItem("token");

    if (!token) {
      // Si no hay token, redirigir a login inmediatamente
      router.push("/ingreso");
      return;
    }

    // Verificar roles si se especifican
    if (allowedRoles.length > 0 && usuario) {
      const hasAllowedRole = allowedRoles.includes(usuario.rol);
      
      if (!hasAllowedRole) {
        // Redirigir según el rol del usuario
        switch(usuario.rol) {
          case 'maestro':
            router.push("/maestro");
            break;
          case 'estudiante':
            router.push("/estudiante");
            break;
          default:
            router.push("/ingreso");
        }
        return;
      }

      // Si tiene rol permitido, autorizar
      setIsAuthorized(hasAllowedRole);
    } else if (!allowedRoles.length) {
      // Si no hay roles especificados, autorizar por defecto
      setIsAuthorized(true);
    }
  }, [usuario, router, allowedRoles]);

  // Si no está autorizado, no renderizar nada
  if (!isAuthorized) {
    return null;
  }

  // Renderizar contenido protegido
  return <>{children}</>;
}