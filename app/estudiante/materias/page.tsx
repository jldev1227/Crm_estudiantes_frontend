"use client";

import React, { useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Tooltip } from "@heroui/tooltip";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import {
  BookOpen,
  User,
  FileText,
  Activity,
  GraduationCap,
} from "lucide-react";

import { useEstudiante } from "@/app/context/EstudianteContext";

export default function Page() {
  const route = useRouter();
  const { areas } = useEstudiante();
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  // Función para obtener icono del área
  const getAreaIcon = (areaNombre: string) => {
    const iconos: { [key: string]: React.ReactNode } = {
      ARTES: <span className="text-2xl">🎨</span>,
      CIENCIAS: <span className="text-2xl">🔬</span>,
      CORPORAL: <span className="text-2xl">🏃</span>,
      DANZAS: <span className="text-2xl">💃</span>,
      "DIMENSIÓN COGNITIVA": <span className="text-2xl">🧠</span>,
      "DIMENSIÓN ÉTICA": <span className="text-2xl">⚖️</span>,
      "EDUCACIÓN FISICA": <span className="text-2xl">⚽</span>,
      EMPRENDIMIENTO: <span className="text-2xl">💡</span>,
      "ESTIMULACIÓN LENGUAJE": <span className="text-2xl">🗣️</span>,
      "ESTIMULACIÓN SENSORIAL": <span className="text-2xl">👂</span>,
      ETICA: <span className="text-2xl">⚖️</span>,
      FRANCES: <span className="text-2xl">&#127467;&#127479;</span>,
      HABILMENTE: <span className="text-2xl">🎯</span>,
      INGLES: <span className="text-2xl">&#127482;&#127480;</span>,
      LENGUAJE: <span className="text-2xl">📚</span>,
      MATEMATICAS: <span className="text-2xl">📊</span>,
      MUSICA: <span className="text-2xl">🎵</span>,
      "PLAN LECTOR": <span className="text-2xl">📖</span>,
      RELIGIÓN: <span className="text-2xl">⛪</span>,
      SCIENCE: <span className="text-2xl">🧪</span>,
      SOCIALES: <span className="text-2xl">🌍</span>,
      SOCIOAFECTIVA: <span className="text-2xl">❤️</span>,
      TECNOLOGIA: <span className="text-2xl">💻</span>,
    };

    return (
      iconos[areaNombre.toUpperCase()] || (
        <BookOpen className="text-gray-600" size={24} />
      )
    );
  };

  // Estadísticas
  const estadisticas = useMemo(() => {
    return {
      totalMaterias: areas?.length || 0,
      profesoresUnicos:
        new Set(areas?.map((area) => area.maestro?.id)).size || 0,
      materiasConTareas: areas?.length || 0, // Asumir que todas tienen tareas
      materiasConActividades: areas?.length || 0, // Asumir que todas tienen actividades
    };
  }, [areas]);

  if (!areas || areas.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="space-y-4">
          <h1 className="text-2xl uppercase font-bold text-blue-600">
            Materias Asignadas
          </h1>
          <p className="text-gray-600">
            Gestiona tus materias asignadas y consulta las actividades
            realizadas para tu curso
          </p>
        </div>

        <Card className="shadow-sm">
          <CardBody className="text-center py-12">
            <div className="text-gray-500">
              <GraduationCap className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes materias asignadas
              </h3>
              <p className="text-sm text-gray-600">
                Contacta al coordinador académico para verificar tu matrícula
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <GraduationCap className="text-blue-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mis Materias</h1>
              <p className="text-gray-600">
                Gestiona tus materias y consulta actividades de tu curso
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <BookOpen className="text-blue-600" size={20} />
            <div>
              <div className="text-xl font-bold text-blue-600">
                {estadisticas.totalMaterias}
              </div>
              <div className="text-xs text-blue-600">Materias</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <User className="text-green-600" size={20} />
            <div>
              <div className="text-xl font-bold text-green-600">
                {estadisticas.profesoresUnicos}
              </div>
              <div className="text-xs text-green-600">Profesores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {isDesktop ? (
        // Vista de tabla para escritorio
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen size={20} />
              Lista de Materias
            </h2>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4">
            <Table
              aria-label="Tabla de materias asignadas"
              className="min-h-[400px]"
            >
              <TableHeader>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold">
                  MATERIA
                </TableColumn>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold">
                  PROFESOR
                </TableColumn>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold text-center">
                  TAREAS
                </TableColumn>
                <TableColumn className="bg-gray-50 text-gray-700 font-semibold text-center">
                  ACTIVIDADES
                </TableColumn>
              </TableHeader>
              <TableBody>
                {areas?.map((area, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getAreaIcon(area.nombre)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {area.nombre}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={14} />
                        </div>
                        <span className="text-gray-700">
                          {area.maestro?.nombre_completo || "Sin asignar"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Tooltip content={`Ver tareas de ${area.nombre}`}>
                        <Button
                          isIconOnly
                          color="warning"
                          size="sm"
                          variant="flat"
                          onPress={() =>
                            route.push(`/estudiante/tareas?area=${area.id}`)
                          }
                        >
                          <FileText size={16} />
                        </Button>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-center">
                      <Tooltip content={`Ver actividades de ${area.nombre}`}>
                        <Button
                          isIconOnly
                          color="primary"
                          size="sm"
                          variant="flat"
                          onPress={() =>
                            route.push(
                              `/estudiante/materias/actividades?area=${area.id}`,
                            )
                          }
                        >
                          <Activity size={16} />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : (
        // Vista de cards para móvil y tablets
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BookOpen size={20} />
            Mis Materias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areas?.map((area, index) => (
              <Card
                key={index}
                className="shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <CardBody className="p-0">
                  {/* Header de la card */}
                  <div className="h-20 bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 text-white">
                      {getAreaIcon(area.nombre)}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {area.nombre}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={14} />
                        <span>
                          {area.maestro?.nombre_completo || "Sin asignar"}
                        </span>
                      </div>
                    </div>

                    <Divider />

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        color="warning"
                        size="sm"
                        startContent={<FileText size={16} />}
                        variant="flat"
                        onPress={() =>
                          route.push(`/estudiante/tareas?area=${area.id}`)
                        }
                      >
                        Tareas
                      </Button>
                      <Button
                        className="flex-1"
                        color="primary"
                        size="sm"
                        startContent={<Activity size={16} />}
                        variant="flat"
                        onPress={() =>
                          route.push(
                            `/estudiante/materias/actividades?area=${area.id}`,
                          )
                        }
                      >
                        Actividades
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
