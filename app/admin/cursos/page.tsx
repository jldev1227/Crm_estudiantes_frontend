"use client";

import React, { useEffect, useMemo } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { useAdmin } from "@/app/context/AdminContext";
import { Curso } from "@/types";

const FolderIcon = () => (
  <svg
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25H11.69Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Page() {
  const router = useRouter();
  const { cursos, obtenerCursos } = useAdmin(); // Cambiado de cursos a cursos

  useEffect(() => {
    obtenerCursos(); // Cambiado de obtenerCursos a obtenerCursos
  }, []);

  // Estadísticas de cursos
  const estadisticasGrados = useMemo(() => {
    if (!cursos)
      return {
        totalGrados: 0,
        gradosConDirector: 0,
        gradosSinDirector: 0,
      };

    return {
      totalGrados: cursos.length,
      gradosConDirector: cursos.filter((g) => g.director).length,
      gradosSinDirector: cursos.filter((g) => !g.director).length,
    };
  }, [cursos]);

  // Funciones de navegación
  const verGrado = (gradoId: number) => {
    router.push(`/admin/cursos/${gradoId}`);
  };

  // Obtener color para el chip según el estado del grado
  const getColorEstado = (grado: Curso) => {
    if (!grado.director) return "warning";

    return "success";
  };

  return (
    <div className="p-4 md:p-10 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl uppercase font-bold text-blue-600">
          Gestión de Grados
        </h1>
        <p className="text-gray-600">
          Administra todos los cursos de la institución, asigna directores y
          supervisa el progreso académico
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {estadisticasGrados.totalGrados}
          </div>
          <div className="text-sm text-blue-600">Total de Grados</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {estadisticasGrados.gradosConDirector}
          </div>
          <div className="text-sm text-green-600">Con Director Asignado</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">
            {estadisticasGrados.gradosSinDirector}
          </div>
          <div className="text-sm text-orange-600">Sin Director</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(
              (estadisticasGrados.gradosConDirector /
                estadisticasGrados.totalGrados) *
                100,
            ) || 0}
            %
          </div>
          <div className="text-sm text-purple-600">Cobertura Directores</div>
        </div>
      </div>

      {/* Cards por Grado */}
      <div className="space-y-6">
        {cursos?.map((grado) => (
          <Card key={grado.id} className="w-full shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {grado.nombre.toUpperCase()}
                    </h3>
                    <Chip
                      className="font-medium mt-1"
                      color={getColorEstado(grado)}
                      size="sm"
                      variant="flat"
                    >
                      {grado.director ? "Director Asignado" : "Sin Director"}
                    </Chip>
                    <div className="flex items-center gap-2 mt-2">
                      {grado.director ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Director:
                          </span>
                          <Chip color="primary" size="sm" variant="flat">
                            {grado.director.nombre_completo}
                          </Chip>
                        </div>
                      ) : (
                        <span className="text-sm text-orange-600 font-medium">
                          ⚠️ Requiere asignación de director
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones principales del grado */}
                <div className="flex items-center gap-2">
                  <Tooltip content="Ver grado completo">
                    <Button
                      isIconOnly
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={() => verGrado(grado.id)}
                    >
                      <GraduationCap strokeWidth={1} />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>

            <Divider />
          </Card>
        ))}
      </div>

      {/* Mensaje si no hay cursos */}
      {(!cursos || cursos.length === 0) && (
        <Card className="w-full">
          <CardBody className="text-center py-12">
            <div className="text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <FolderIcon />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay cursos registrados
              </h3>
              <p className="text-sm text-gray-600">
                Comienza creando los cursos de la institución educativa
              </p>
              <Button
                className="mt-4"
                color="primary"
                onPress={() => router.push("/admin/cursos/crear")}
              >
                Crear Primer Grado
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
