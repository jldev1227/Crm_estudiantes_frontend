"use client";

import React, { useEffect } from "react";

import { useAdmin } from "@/app/context/AdminContext";
import MaestrosResponsive from "@/components/maestroResponsive";

export default function Page() {
  const { maestros, estaCargando, obtenerMaestros } = useAdmin();

  useEffect(() => {
    obtenerMaestros();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl uppercase font-bold text-blue-600">Maestros</h1>
        <p>
          Como administrador, puedes gestionar los maestros, asignarles cursos y
          consultar la información detallada de sus asignaciones.
        </p>
      </div>

      <div>
        {!estaCargando && maestros.length > 0 ? (
          <MaestrosResponsive maestros={maestros} />
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
            <strong className="font-bold">¡Atención!</strong>
            <span className="block sm:inline ml-2">
              No hay maestros registrados.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
