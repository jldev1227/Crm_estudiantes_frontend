"use client";

import React, { useEffect } from "react";
import { useAdmin } from "@/app/context/AdminContext";
import MaestrosResponsive from "@/components/maestroResponsive";

export default function Page() {
  const { maestros, obtenerMaestros } = useAdmin();

  useEffect(() => {
    obtenerMaestros();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl uppercase font-bold text-blue-600">
          Maestros
        </h1>
        <p>
          Como administrador, puedes gestionar los maestros, asignarles cursos y consultar la información detallada de sus asignaciones.
        </p>
      </div>

      <div>
        <MaestrosResponsive maestros={maestros}/>
      </div>
    </div>
  );
}
