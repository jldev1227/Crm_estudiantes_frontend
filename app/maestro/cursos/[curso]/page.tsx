"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { GraduationCap } from "lucide-react";
import { Download } from "lucide-react";

import EstudiantesResponsive from "@/components/estudiantesResponsive";
import { useAuth } from "@/app/context/AuthContext";
import { useValidateCourseAccess } from "@/hooks/useValidateCourseAccess";
import { useMaestro } from "@/app/context/MaestroContext";

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
  const [zipError, setZipError] = useState<string | null>(null);
  const [downloadingPeriodo, setDownloadingPeriodo] = useState(false);
  const [downloadingFinal, setDownloadingFinal] = useState(false);

  const { obtenerCursoGeneral, curso, periodoSeleccionado, establecerPeriodo } =
    useMaestro();

  // Glass style utility
  const GLASS_CARD =
    "backdrop-blur-xl bg-white/50 dark:bg-zinc-900/40 border border-white/30 dark:border-white/10 shadow-lg";

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
        console.error(err);
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
      <Card className={GLASS_CARD}>
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
    <div className="space-y-6 p-4 md:p-10 max-w-[1200px] mx-auto">
      {/* Header del Curso */}
      <Card className={GLASS_CARD}>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 xl:flex-row justify-between items-start xl:items-center w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                <GraduationCap className="text-blue-700" strokeWidth={1} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {curso.nombre}
                </h1>
                <p className="text-xs text-gray-600">ID: {curso.id}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
              <Button
                className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                color="primary"
                isLoading={downloadingPeriodo}
                size="sm"
                startContent={<Download className="w-3.5 h-3.5" />}
                variant="solid"
                onPress={async () => {
                  try {
                    setZipError(null);
                    setDownloadingPeriodo(true);
                    const base =
                      process.env.NEXT_PUBLIC_BACKEND_URL ||
                      "http://localhost:4000";
                    const url = `${base}/api/reportes/grado/${id}/periodo/${periodoSeleccionado || 1}.zip`;
                    const headers: Record<string, string> = {};

                    if (typeof window !== "undefined") {
                      const token = localStorage.getItem("token");

                      if (token) headers["Authorization"] = `Bearer ${token}`;
                    }
                    const res = await fetch(url, { headers });

                    if (!res.ok) {
                      let msg = `Error ${res.status}`;

                      try {
                        const j = await res.json();

                        if (j?.error) msg = j.error;
                      } catch {}
                      throw new Error(msg);
                    }
                    const blob = await res.blob();
                    const cd = res.headers.get("Content-Disposition") || "";
                    let filename = `Reportes - ${curso?.nombre || "Grado"} - Periodo ${periodoSeleccionado || 1}.zip`;
                    const match =
                      /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
                        cd,
                      );

                    if (match)
                      filename = decodeURIComponent(match[1] || match[2]);
                    const link = document.createElement("a");

                    link.href = URL.createObjectURL(blob);
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    URL.revokeObjectURL(link.href);
                  } catch (e: any) {
                    setZipError(
                      e?.message || "Error descargando reportes del período",
                    );
                  } finally {
                    setDownloadingPeriodo(false);
                  }
                }}
              >
                Informes del período (ZIP)
              </Button>
              <Button
                className="h-10 bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                color="primary"
                isLoading={downloadingFinal}
                size="sm"
                startContent={<Download className="w-3.5 h-3.5" />}
                variant="solid"
                onPress={async () => {
                  try {
                    setZipError(null);
                    setDownloadingFinal(true);
                    const base =
                      process.env.NEXT_PUBLIC_BACKEND_URL ||
                      "http://localhost:4000";
                    const url = `${base}/api/reportes/grado/${id}/boletin-final.zip`;
                    const headers: Record<string, string> = {};

                    if (typeof window !== "undefined") {
                      const token = localStorage.getItem("token");

                      if (token) headers["Authorization"] = `Bearer ${token}`;
                    }
                    const res = await fetch(url, { headers });

                    if (!res.ok) {
                      let msg = `Error ${res.status}`;

                      try {
                        const j = await res.json();

                        if (j?.error) msg = j.error;
                      } catch {}
                      throw new Error(msg);
                    }
                    const blob = await res.blob();
                    const cd = res.headers.get("Content-Disposition") || "";
                    let filename = `Boletines Finales - ${curso?.nombre || "Grado"}.zip`;
                    const match =
                      /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
                        cd,
                      );

                    if (match)
                      filename = decodeURIComponent(match[1] || match[2]);
                    const link = document.createElement("a");

                    link.href = URL.createObjectURL(blob);
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    URL.revokeObjectURL(link.href);
                  } catch (e: any) {
                    setZipError(
                      e?.message || "Error descargando boletines finales",
                    );
                  } finally {
                    setDownloadingFinal(false);
                  }
                }}
              >
                Boletines finales (ZIP)
              </Button>
              <Select
                aria-label="Seleccionar período"
                className="w-full sm:w-40"
                selectedKeys={[(periodoSeleccionado || 1).toString()]}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string;
                  const p = parseInt(key);

                  establecerPeriodo(p);
                }}
              >
                <SelectItem key="1">Período 1</SelectItem>
                <SelectItem key="2">Período 2</SelectItem>
                <SelectItem key="3">Período 3</SelectItem>
                <SelectItem key="4">Período 4</SelectItem>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {zipError && (
        <Card className="backdrop-blur-xl bg-red-50/80 border border-red-200/60">
          <CardBody className="py-3">
            <p className="text-sm text-red-700 font-medium">{zipError}</p>
          </CardBody>
        </Card>
      )}

      {/* Estadísticas del Curso */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={GLASS_CARD}>
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

          <Card className={GLASS_CARD}>
            <CardBody className="text-center py-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {estadisticas.totalAreas}
              </div>
              <div className="text-sm text-green-600">Áreas</div>
            </CardBody>
          </Card>

          <Card className={GLASS_CARD}>
            <CardBody className="text-center py-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {estadisticas.totalMaestros}
              </div>
              <div className="text-sm text-orange-600">Maestros Asignados</div>
            </CardBody>
          </Card>

          <Card className={GLASS_CARD}>
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
        <Card className={GLASS_CARD}>
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
                <Card key={index} className={GLASS_CARD}>
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
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

      {/* Sección para el Componente de Estudiantes */}
      <Card className={GLASS_CARD}>
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
