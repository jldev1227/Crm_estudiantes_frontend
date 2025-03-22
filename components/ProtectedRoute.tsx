"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLazyQuery } from "@apollo/client";
import { VERIFY_TOKEN } from "@/app/graphql/queries/verificarToken";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles = []
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { usuario, logout } = useAuth();

  // Query para verificar el token
  const [verifyToken, { error: tokenError }] = useLazyQuery(VERIFY_TOKEN, {
    fetchPolicy: "network-only"
  });

  const checkAuthentication = useCallback(async () => {
    setIsLoading(true);

    // Verificar si hay token
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/ingreso");
      return;
    }

    try {
      // Verificar si el token es válido con el backend
      const { data } = await verifyToken();

      // Si no hay datos o la validación indica que no es válido
      if (!data?.verifyToken?.valid || tokenError) {
        console.error("Token inválido o expirado:", tokenError || "Validación falló");
        logout(); // Utiliza la función logout del contexto
        toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
        router.push("/ingreso");
        return;
      }

      // Verificar que el usuario tenga un rol en el token verificado
      const userFromToken = data.verifyToken.user;
      if (!userFromToken || !userFromToken.rol) {
        console.error("Token no contiene información de rol");
        logout();
        toast.error("Error de autenticación. Por favor inicia sesión nuevamente.");
        router.push("/ingreso");
        return;
      }

      // Si hay roles especificados, verificar si el usuario tiene alguno de esos roles
      if (allowedRoles.length > 0) {
        // Usar el rol del token verificado (más seguro que confiar en el estado local)
        const hasAllowedRole = allowedRoles.includes(userFromToken.rol);

        if (!hasAllowedRole) {
          // Redirigir según el rol del usuario
          switch (userFromToken.rol) {
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

        setIsAuthorized(hasAllowedRole);
      } else {
        // Si no hay roles especificados, autorizar por defecto si el token es válido
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error("Error al verificar autenticación:", error);
      logout(); // Utiliza la función logout del contexto
      toast.error("Error de autenticación. Por favor inicia sesión nuevamente.");
      router.push("/ingreso");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (isMounted) {
        await checkAuthentication();
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [checkAuthentication]);
  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autorizado, no renderizar nada
  if (!isAuthorized) {
    return null;
  }

  // Renderizar contenido protegido
  return (
    <>
      {children}
    </>
  );
}