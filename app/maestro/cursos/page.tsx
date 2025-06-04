"use client";

import React, { useEffect, useMemo } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { Area, Curso, Grado } from "@/types";
import { useAuth } from "@/app/context/AuthContext";
import { useMaestro } from "@/app/context/MaestroContext";

type GradoData = {
  grado: Grado;
  esDirector: boolean;
  materias: Array<{
    grado: Grado;
    area: Area;
  }>;
};

type CursosPorGrado = Record<string, GradoData>;

// Iconos como componentes
const EyeIcon = () => (
  <svg
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocumentIcon = () => (
  <svg
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4.5v15m7.5-7.5h-15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
  const { cursos, obtenerCursosMaestro } = useMaestro();
  const { usuario } = useAuth();

  useEffect(() => {
    obtenerCursosMaestro();
  }, []);

  // Agrupar cursos por grado
  const cursosPorGrado = useMemo(() => {
    if (!cursos) return {};

    console.log(cursos);

    return cursos.reduce(
      (
        acc: {
          [key: string]: {
            grado: Grado;
            materias: Curso[];
            esDirector: boolean;
          };
        },
        curso: Curso,
      ) => {
        const gradoNombre = curso.grado.nombre;

        if (!acc[gradoNombre]) {
          // Verificar si el maestro actual es director de este grado
          const esDirectorDelGrado = curso.grado.director?.id === usuario?.id;

          acc[gradoNombre] = {
            grado: curso.grado,
            materias: [],
            esDirector: esDirectorDelGrado,
          };
        }

        acc[gradoNombre].materias.push(curso);

        return acc;
      },
      {},
    );
  }, [cursos, usuario?.id]);

  // Funciones de navegación por materia
  const verMateria = (gradoId: string, areaId: string) => {
    router.push(`/maestro/cursos/${gradoId}/areas/${areaId}`);
  };

  const agregarActividad = (gradoId: string, areaId: string) => {
    router.push(
      `/maestro/cursos/${gradoId}/areas/${areaId}/actividades/agregar`,
    );
  };

  const verReportesMateria = (gradoId: string, areaId: string) => {
    router.push(`/maestro/cursos/${gradoId}/areas/${areaId}/calificaciones`);
  };

  // Funciones de navegación por grado
  const verGradoCompleto = (gradoId: string) => {
    router.push(`/maestro/cursos/${gradoId}`);
  };

  // Obtener color para el chip según el área
  const getColorArea = (areaNombre: string) => {
    const colores: { [key: string]: any } = {
      MATEMATICAS: "primary",
      ESPAÑOL: "secondary",
      CIENCIAS: "success",
      SOCIALES: "warning",
      INGLES: "danger",
      "EDUCACION FISICA": "default",
    };

    return colores[areaNombre.toUpperCase()] || "default";
  };

  return (
    <div className="space-y-6 p-4 md:p-10">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl uppercase font-bold text-blue-600">
          Cursos Asignados
        </h1>
        <p className="text-gray-600">
          Gestiona tus cursos asignados y realiza el registro de actividades
          realizadas en cada curso
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(cursosPorGrado).length}
          </div>
          <div className="text-sm text-blue-600">Grados Asignados</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {cursos?.length || 0}
          </div>
          <div className="text-sm text-green-600">Total de Materias</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">
            {
              Object.values(cursosPorGrado as CursosPorGrado).filter(
                (g: GradoData) => g.esDirector,
              ).length
            }
          </div>
          <div className="text-sm text-orange-600">Grados que Diriges</div>
        </div>
      </div>

      {/* Cards por Grado */}
      <div className="space-y-6">
        {Object.values(cursosPorGrado as CursosPorGrado).map(
          (gradoData: GradoData) => (
            <Card key={gradoData.grado.id} className="w-full shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {gradoData.grado.nombre.toUpperCase()}
                      </h3>
                      {gradoData.esDirector && (
                        <Chip
                          className="font-medium"
                          color="success"
                          size="sm"
                          variant="flat"
                        >
                          Director
                        </Chip>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">
                          {gradoData.materias.length} materia
                          {gradoData.materias.length !== 1 ? "s" : ""} asignada
                          {gradoData.materias.length !== 1 ? "s" : ""}
                        </span>
                        {gradoData.grado.director && !gradoData.esDirector && (
                          <Chip color="default" size="sm" variant="flat">
                            Director:{" "}
                            {gradoData.grado.director.nombre_completo ||
                              "Sin nombre"}
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones generales del grado */}
                  {gradoData.esDirector && (
                    <div className="flex items-center gap-2">
                      <Tooltip content="Ver grado completo">
                        <Button
                          isIconOnly
                          color="primary"
                          size="sm"
                          variant="flat"
                          onPress={() => verGradoCompleto(gradoData.grado.id)}
                        >
                          <GraduationCap strokeWidth={1} />
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </CardHeader>

              <Divider />

              <CardBody className="pt-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Materias que enseñas en este grado
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {gradoData.materias.map((curso) => (
                      <div
                        key={`${curso.grado.id}-${curso.area.id}`}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Chip
                            className="font-medium"
                            color={getColorArea(curso.area.nombre)}
                            size="sm"
                            variant="flat"
                          >
                            {curso.area.nombre}
                          </Chip>
                          <span className="text-sm text-gray-600">
                            Área de {curso.area.nombre.toLowerCase()}
                          </span>
                        </div>

                        {/* Acciones por materia */}
                        <div className="flex items-center gap-1">
                          <Tooltip content={`Ver ${curso.area.nombre}`}>
                            <Button
                              isIconOnly
                              color="primary"
                              size="sm"
                              variant="light"
                              onPress={() =>
                                verMateria(curso.grado.id, curso.area.id)
                              }
                            >
                              <EyeIcon />
                            </Button>
                          </Tooltip>

                          <Tooltip
                            content={`Agregar actividad a ${curso.area.nombre}`}
                          >
                            <Button
                              isIconOnly
                              color="success"
                              size="sm"
                              variant="light"
                              onPress={() =>
                                agregarActividad(curso.grado.id, curso.area.id)
                              }
                            >
                              <PlusIcon />
                            </Button>
                          </Tooltip>

                          <Tooltip
                            content={`Calificaciones de ${curso.area.nombre}`}
                          >
                            <Button
                              isIconOnly
                              color="secondary"
                              size="sm"
                              variant="light"
                              onPress={() =>
                                verReportesMateria(
                                  curso.grado.id,
                                  curso.area.id,
                                )
                              }
                            >
                              <DocumentIcon />
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Acciones rápidas del grado
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Acciones rápidas para {gradoData.grado.nombre}:
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="light"
                        onPress={() => verGradoCompleto(gradoData.grado.id)}
                        startContent={<FolderIcon />}
                      >
                        Ver todo
                      </Button>
                      <Button
                        size="sm"
                        color="success"
                        variant="light"
                        onPress={() => verCalificaciones(gradoData.grado.id)}
                        startContent={<DocumentIcon />}
                      >
                        Calificaciones
                      </Button>
                    </div>
                  </div>
                </div> */}
                </div>
              </CardBody>
            </Card>
          ),
        )}
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
                No tienes cursos asignados
              </h3>
              <p className="text-sm text-gray-600">
                Contacta al coordinador académico para que te asigne cursos y
                materias
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
