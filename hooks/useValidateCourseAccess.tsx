// Hook simple para validación de acceso
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/app/context/AuthContext";
import { Curso } from "@/types";

// Solución 1: Hook que retorna si debe mostrar contenido
export const useValidateCourseAccess = (curso: Curso) => {
  const { usuario } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(true); // Siempre inicia en true
  const [hasValidated, setHasValidated] = useState(false);

  useEffect(() => {
    // Si no hay datos aún, no hacer nada pero mantener el hook
    if (!usuario || !curso || !curso.director) {
      return; // ✅ No hacer early return antes del hook
    }

    // Solo validar una vez
    if (hasValidated) return;

    // Validación simple: admin OR director del curso
    const hasAccess =
      usuario.rol === "admin" || usuario.id === curso.director?.id;

    if (!hasAccess) {
      setShouldRender(false);
      setHasValidated(true);
      alert("No tienes permisos para acceder a este curso");
      router.back();
    } else {
      setShouldRender(true);
      setHasValidated(true);
    }
  }, [usuario, curso, router, hasValidated]);

  return shouldRender;
};
