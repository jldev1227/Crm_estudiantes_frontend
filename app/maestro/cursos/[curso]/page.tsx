"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { GraduationCap } from "lucide-react";

import EstudiantesResponsive from "@/components/estudiantesResponsive";
import { useAuth } from "@/app/context/AuthContext";
import { useValidateCourseAccess } from "@/hooks/useValidateCourseAccess";
import { useMaestro } from "@/app/context/MaestroContext";
import { Area } from "@/types";

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

const ChartIcon = () => (
  <svg
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserGroupIcon = () => (
  <svg
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CursoDashboard() {
  const params = useParams();
  const router = useRouter();
  const id = params.curso as string;
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { obtenerCursoGeneral, curso } = useMaestro();

  // Efecto para cargar datos del curso usando el contexto
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (id) {
          await obtenerCursoGeneral(id);
        }
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos del curso");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const shouldRender = useValidateCourseAccess(curso);

  // Procesar datos para estadísticas
  const estadisticas = useMemo(() => {
    if (!curso?.areas || !curso?.estudiantes) return null;

    const maestrosUnicos = new Set(
      curso.areas.map((area: any) => area.maestro.id),
    );
    const areasDelDirector = curso.areas.filter(
      (area: any) => area.maestro.id === curso.director.id,
    );

    return {
      totalEstudiantes: curso.estudiantes.length,
      totalAreas: curso.areas.length,
      totalMaestros: maestrosUnicos.size,
      areasDelDirector: areasDelDirector.length,
      porcentajeDirector: Math.round(
        (areasDelDirector.length / curso.areas.length) * 100,
      ),
    };
  }, [curso]);

  // Agrupar áreas por maestro
  const areasPorMaestro = useMemo(() => {
    if (!curso?.areas) return [];

    const grupos = curso.areas.reduce((acc: any, area: any) => {
      const maestroId = area.maestro.id;

      if (!acc[maestroId]) {
        acc[maestroId] = {
          maestro: area.maestro,
          areas: [],
          esDirector: maestroId === curso.director.id,
        };
      }
      acc[maestroId].areas.push(area);

      return acc;
    }, {});

    return Object.values(grupos);
  }, [curso]);

  // Obtener color para el chip según el área
  const getColorArea = (areaNombre: string) => {
    const colores: { [key: string]: any } = {
      LENGUAJE: "primary",
      MATEMATICAS: "secondary",
      CIENCIAS: "success",
      SOCIALES: "warning",
      INGLES: "danger",
      "EDUCACIÓN FISICA": "default",
      ARTES: "secondary",
      MUSICA: "success",
      TECNOLOGIA: "warning",
      FRANCES: "primary",
    };

    return colores[areaNombre.toUpperCase()] || "default";
  };

  // Navegación
  const verArea = (areaId: number) => {
    router.push(`/maestro/cursos/${curso.id}/areas/${areaId}`);
  };

  const verMaestro = (maestroId: string) => {
    router.push(`/maestro/maestros/${maestroId}/perfil`);
  };

  if (!shouldRender) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        <p className="text-primary">Verificando permisos</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        <p className="text-primary">Cargando</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border border-red-200 bg-red-50">
        <CardBody className="text-center py-8">
          <div className="text-red-700">
            <p className="font-medium">{error}</p>
            <Button
              className="mt-4"
              color="danger"
              variant="light"
              onPress={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  // No course found
  if (!curso) {
    return (
      <Card className="border border-gray-200">
        <CardBody className="text-center py-8">
          <div className="text-gray-500">
            <GraduationCap strokeWidth={1} />
            <p className="mt-2 font-medium">
              No se encontró información del curso
            </p>
            <p className="text-sm">Verifica que el ID del curso sea correcto</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-10">
      {/* Header del Curso */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <GraduationCap strokeWidth={1} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">
                  {curso.nombre}
                </h1>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas del Curso */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border border-blue-200">
            <CardBody className="text-center py-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {estadisticas.totalEstudiantes}
              </div>
              <div className="text-sm text-blue-600 flex items-center justify-center gap-1">
                <UserGroupIcon />
                Estudiantes
              </div>
            </CardBody>
          </Card>

          <Card className="bg-green-50 border border-green-200">
            <CardBody className="text-center py-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {estadisticas.totalAreas}
              </div>
              <div className="text-sm text-green-600">Áreas</div>
            </CardBody>
          </Card>

          <Card className="bg-orange-50 border border-orange-200">
            <CardBody className="text-center py-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {estadisticas.totalMaestros}
              </div>
              <div className="text-sm text-orange-600">Maestros Asignados</div>
            </CardBody>
          </Card>

          <Card className="bg-purple-50 border border-purple-200">
            <CardBody className="text-center py-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {estadisticas.porcentajeDirector}%
              </div>
              <div className="text-sm text-purple-600">Tu carga Académica</div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Maestros y sus Áreas */}
      {areasPorMaestro.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-bold text-gray-800">
                Maestros y Áreas Asignadas
              </h2>
              <Chip color="default" size="sm" variant="flat">
                {areasPorMaestro.length} maestros
              </Chip>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {areasPorMaestro.map((grupo: any, index: number) => (
                <Card key={index} className="bg-gray-50 border">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className={
                            grupo.esDirector
                              ? "bg-green-600 text-white"
                              : "bg-gray-600 text-white"
                          }
                          name={grupo.maestro.nombre_completo
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                          size="md"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {grupo.maestro.nombre_completo}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {grupo.maestro.email}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {grupo.esDirector && (
                              <Chip color="success" size="sm" variant="dot">
                                Tú
                              </Chip>
                            )}
                            <Chip color="default" size="sm" variant="flat">
                              {grupo.areas.length} área
                              {grupo.areas.length !== 1 ? "s" : ""}
                            </Chip>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Áreas que enseña{grupo.esDirector && "s"}:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {grupo.areas.map((area: any) => (
                          <Tooltip key={area.id} content={`Ver ${area.nombre}`}>
                            <Chip
                              className="cursor-pointer hover:scale-105 transition-transform"
                              color={getColorArea(area.nombre)}
                              size="sm"
                              variant="flat"
                              onClick={() => verArea(area.id)}
                            >
                              {area.nombre}
                            </Chip>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Listado de Todas las Áreas - CÓDIGO ACTUALIZADO */}
      {curso.areas && curso.areas.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-bold text-gray-800">
                Todas las Áreas Académicas
              </h2>
              <Chip color="primary" size="sm" variant="flat">
                {curso.areas.length} áreas
              </Chip>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {curso.areas.map((area: Area, index: number) => {
                // ✅ Verificar si el usuario actual es el maestro asignado a esta área
                const esMaestroAsignado = area.maestro.id === usuario?.id;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Chip
                        color={getColorArea(area.nombre)}
                        size="sm"
                        variant="flat"
                      >
                        {area.nombre}
                      </Chip>
                      <div className="text-xs text-gray-600">
                        {area.maestro.nombre_completo
                          .split(" ")
                          .slice(0, 2)
                          .join(" ")}
                        {/* ✅ Indicador visual si es tu área */}
                        {esMaestroAsignado && (
                          <Chip
                            className="ml-2"
                            color="success"
                            size="sm"
                            variant="dot"
                          >
                            Tu área
                          </Chip>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {/* ✅ Solo mostrar botones si es el maestro asignado */}
                      {esMaestroAsignado ? (
                        <>
                          <Tooltip content={`Ver ${area.nombre}`}>
                            <Button
                              isIconOnly
                              color="primary"
                              size="sm"
                              variant="light"
                              onPress={() => verArea(area.id)}
                            >
                              <EyeIcon />
                            </Button>
                          </Tooltip>
                          <Tooltip
                            content={`Añadir actividad a ${area.nombre}`}
                          >
                            <Button
                              isIconOnly
                              color="success"
                              size="sm"
                              variant="light"
                              onPress={() =>
                                router.push(
                                  `/maestro/cursos/${curso.id}/areas/${area.id}/actividades/nueva`,
                                )
                              }
                            >
                              <PlusIcon />
                            </Button>
                          </Tooltip>
                        </>
                      ) : (
                        /* ✅ Mostrar indicador de "no accesible" para áreas de otros maestros */
                        <Tooltip content="Solo el maestro asignado puede acceder">
                          <div className="flex items-center text-gray-400">
                            <Chip color="default" size="sm" variant="flat">
                              Sin acceso
                            </Chip>
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Sección para el Componente de Estudiantes */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-gray-800">
              Estudiantes del Curso
            </h2>
            <Chip color="success" size="sm" variant="flat">
              {curso.estudiantes?.length || 0} estudiantes
            </Chip>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-4">
          {/* Aquí insertas tu componente de tabla de estudiantes */}
          <EstudiantesResponsive
            estudiantes={curso.estudiantes}
            isDirector={curso.director.id === usuario?.id}
            isVisible={true}
          />
        </CardBody>
      </Card>
    </div>
  );
}
