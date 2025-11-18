"use client";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import {
  ArrowLeft,
  Users,
  AlertCircle,
  Award,
  TrendingUp,
  Star,
  CheckCircle2,
  XCircle,
  Minus,
  TrendingDown,
  Download,
} from "lucide-react";
import { SharedSelection } from "@heroui/system";

import { useAdmin } from "@/app/context/AdminContext";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const grado_id = params?.curso as string;

  const {
    calificacionesGrado,
    establecerPeriodo,
    periodoSeleccionado,
    obtenerCalificaciones,
  } = useAdmin();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadingPeriodo, setDownloadingPeriodo] = useState(false);
  const [downloadingFinal, setDownloadingFinal] = useState(false);

  const obtenerCalificacionesRef = useRef(obtenerCalificaciones);

  useEffect(() => {
    obtenerCalificacionesRef.current = obtenerCalificaciones;
  }, [obtenerCalificaciones]);

  const establecerPeriodoRef = useRef(establecerPeriodo);

  useEffect(() => {
    establecerPeriodoRef.current = establecerPeriodo;
  }, [establecerPeriodo]);

  useEffect(() => {
    const periodoFromUrl = searchParams.get("periodo");

    if (periodoFromUrl) {
      const periodo = parseInt(periodoFromUrl);

      if (periodo >= 1 && periodo <= 4 && periodo !== periodoSeleccionado) {
        establecerPeriodoRef.current(periodo);
      }
    }
  }, [searchParams, periodoSeleccionado]);

  const fetchData = useCallback(async () => {
    if (!grado_id) return;

    setLoading(true);
    setError("");

    try {
      await obtenerCalificacionesRef.current(
        Number(grado_id),
        periodoSeleccionado,
      );
    } catch (err) {
      setError("Error al cargar los datos del grado");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [grado_id, periodoSeleccionado]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDescargarPeriodoZip = useCallback(async () => {
    try {
      setDownloadingPeriodo(true);
      setError("");

      const base =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const url = `${base}/api/reportes/grado/${grado_id}/periodo/${periodoSeleccionado}.zip`;
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
      let filename = `Reportes - ${calificacionesGrado?.grado?.nombre || "Grado"} - Periodo ${periodoSeleccionado}.zip`;
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);

      if (match) filename = decodeURIComponent(match[1] || match[2]);

      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Error descargando reportes");
    } finally {
      setDownloadingPeriodo(false);
    }
  }, [grado_id, periodoSeleccionado, calificacionesGrado?.grado?.nombre]);

  const handleDescargarBoletinesZip = useCallback(async () => {
    try {
      setDownloadingFinal(true);
      setError("");
      const base =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const url = `${base}/api/reportes/grado/${grado_id}/boletin-final.zip`;
      const headers: Record<string, string> = {};
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (token) headers["Authorization"] = `Bearer ${token}`;
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
      let filename = `Boletines Finales - ${calificacionesGrado?.grado?.nombre || "Grado"}.zip`;
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);

      if (match) filename = decodeURIComponent(match[1] || match[2]);
      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Error descargando boletines finales");
    } finally {
      setDownloadingFinal(false);
    }
  }, [grado_id, calificacionesGrado?.grado?.nombre]);

  const handlePeriodoChange = (keys: SharedSelection) => {
    const key = Array.from(keys)[0] as string;
    const periodo = parseInt(key);

    establecerPeriodo(periodo);

    const current = new URLSearchParams(Array.from(searchParams.entries()));

    current.set("periodo", periodo.toString());
    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${window.location.pathname}${query}`, { scroll: false });
  };

  const getNotaColor = (nota: number): "success" | "warning" | "danger" => {
    if (nota >= 3.5) return "success";
    if (nota >= 3.0) return "warning";

    return "danger";
  };

  const getNotaIcon = (nota: number) => {
    if (nota >= 4.5) return <Star className="w-3.5 h-3.5" />;
    if (nota >= 3.5) return <TrendingUp className="w-3.5 h-3.5" />;
    if (nota >= 3.0) return <Minus className="w-3.5 h-3.5" />;

    return <TrendingDown className="w-3.5 h-3.5" />;
  };

  const estudiantesAgrupados = React.useMemo(() => {
    if (!calificacionesGrado?.calificaciones) return {};

    return calificacionesGrado.calificaciones.reduce(
      (acc: any, calificacion: any) => {
        const estudianteId = calificacion.estudiante.id;

        if (!acc[estudianteId]) {
          acc[estudianteId] = {
            estudiante: calificacion.estudiante,
            areas: [],
          };
        }

        acc[estudianteId].areas.push({
          area: calificacion.area,
          notaFinal: calificacion.notaFinal,
        });

        return acc;
      },
      {},
    );
  }, [calificacionesGrado]);

  const calcularPromedioEstudiante = (areas: any[]) => {
    if (!areas || areas.length === 0) return 0;
    const suma = areas.reduce((acc, item) => acc + (item.notaFinal || 0), 0);

    return suma / areas.length;
  };

  const calcularEstadisticas = () => {
    const estudiantes = Object.values(estudiantesAgrupados);
    const promedios = estudiantes.map((est: any) =>
      calcularPromedioEstudiante(est.areas),
    );

    const aprobados = promedios.filter((p) => p >= 3.0).length;
    const reprobados = promedios.filter((p) => p < 3.0).length;
    const promedioGeneral =
      promedios.reduce((a, b) => a + b, 0) / promedios.length || 0;

    return {
      total: estudiantes.length,
      aprobados,
      reprobados,
      promedioGeneral,
      porcentajeAprobacion:
        estudiantes.length > 0 ? (aprobados / estudiantes.length) * 100 : 0,
    };
  };

  const stats = calcularEstadisticas();

  if (loading && !calificacionesGrado) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Spinner color="primary" size="lg" />
        <p className="text-sm text-gray-500">Cargando calificaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Minimalista */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/40 border border-white/30 shadow-lg">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="relative z-10 p-6">
          <div className="flex flex-col gap-4 xl:flex-row justify-between items-start xl:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {calificacionesGrado?.grado?.nombre || "Cargando..."}
                </h1>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {stats.total} estudiantes
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  {stats.porcentajeAprobacion.toFixed(0)}% aprobación
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 font-semibold text-blue-600">
                  <Star className="w-3.5 h-3.5" />
                  {stats.promedioGeneral.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap w-full xl:w-auto items-stretch gap-2 xl:justify-end">
              <Button
                aria-label="Descargar todos los informes del período en un archivo ZIP"
                className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                color="primary"
                isLoading={downloadingPeriodo}
                size="sm"
                startContent={<Download className="w-3.5 h-3.5" />}
                variant="solid"
                onPress={handleDescargarPeriodoZip}
              >
                Informes del período (ZIP)
              </Button>
              <Button
                aria-label="Descargar todos los boletines finales consolidados en un archivo ZIP"
                className="h-10 bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                color="primary"
                isLoading={downloadingFinal}
                size="sm"
                startContent={<Download className="w-3.5 h-3.5" />}
                variant="solid"
                onPress={handleDescargarBoletinesZip}
              >
                Boletines finales (ZIP)
              </Button>
              <Select
                disallowEmptySelection
                aria-label="Seleccionar período"
                className="w-full sm:w-40"
                classNames={{
                  trigger:
                    "h-9 bg-white border border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",
                }}
                selectedKeys={[periodoSeleccionado.toString()]}
                size="sm"
                variant="bordered"
                onSelectionChange={handlePeriodoChange}
              >
                <SelectItem key="1">Período 1</SelectItem>
                <SelectItem key="2">Período 2</SelectItem>
                <SelectItem key="3">Período 3</SelectItem>
                <SelectItem key="4">Período 4</SelectItem>
              </Select>

              <Button
                aria-label="Volver a la vista del curso"
                className="h-10 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                color="primary"
                size="sm"
                startContent={<ArrowLeft className="w-3.5 h-3.5" />}
                variant="solid"
                onPress={() => router.push(`/admin/cursos/${grado_id}`)}
              >
                Volver
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl backdrop-blur-xl bg-red-50/80 border border-red-200/50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 text-sm">{error}</p>
              <p className="text-xs text-red-700">
                Por favor, intenta recargar la página
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards Minimalistas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 border transition-all bg-green-100/80 border-green-200 hover:bg-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                Aprobados
              </p>
              <p className="text-2xl font-bold text-green-700">
                {stats.aprobados}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 border transition-all bg-red-100/80 border-red-200 hover:bg-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                Reprobados
              </p>
              <p className="text-2xl font-bold text-red-700">
                {stats.reprobados}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-red-500/10">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 border transition-all bg-blue-100/80 border-blue-200 hover:bg-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Promedio</p>
              <p className="text-2xl font-bold text-blue-700">
                {stats.promedioGeneral.toFixed(2)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista Vertical de Estudiantes */}
      {Object.keys(estudiantesAgrupados).length > 0 ? (
        <div className="space-y-3">
          {Object.entries(estudiantesAgrupados).map(
            ([estudianteId, data]: [string, any]) => {
              const promedio = calcularPromedioEstudiante(data.areas);

              return (
                <div
                  key={estudianteId}
                  className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/50 border border-white/40 shadow-sm hover:shadow-md hover:bg-white/60 transition-all duration-300"
                >
                  <div className="p-5">
                    {/* Header del Estudiante */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate">
                          {data.estudiante.nombre_completo}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100/80 font-medium">
                            {data.estudiante.tipo_documento}
                          </span>
                          <span className="font-mono text-gray-500">
                            {data.estudiante.numero_identificacion}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-600 mb-0.5">
                            Promedio
                          </p>
                          <Chip
                            classNames={{
                              base: "font-bold",
                            }}
                            color={getNotaColor(promedio)}
                            size="sm"
                            variant="flat"
                          >
                            {promedio.toFixed(2)}
                          </Chip>
                        </div>
                      </div>
                    </div>

                    <Divider className="mb-3 bg-gray-200/50" />

                    {/* Lista de Áreas - Vertical en Desktop */}
                    <div className="flex flex-wrap items-center gap-2">
                      {data.areas.map((areaData: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-white/80 border border-gray-100/50 transition-all"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex-shrink-0">
                              {getNotaIcon(areaData.notaFinal)}
                            </div>
                            <span className="text-sm font-medium text-gray-800 truncate">
                              {areaData.area.nombre}
                            </span>
                          </div>
                          <Chip
                            classNames={{
                              base: "font-semibold flex-shrink-0 ml-2",
                            }}
                            color={getNotaColor(areaData.notaFinal)}
                            size="sm"
                            variant="flat"
                          >
                            {areaData.notaFinal.toFixed(1)}
                          </Chip>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      ) : (
        <div className="rounded-2xl backdrop-blur-xl bg-white/50 border border-white/40 p-16">
          <div className="text-center">
            <div className="inline-flex p-5 rounded-2xl bg-gray-100/80 mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No hay calificaciones disponibles
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              No se encontraron calificaciones para este período
            </p>
            <Button
              color="primary"
              isLoading={loading}
              size="sm"
              variant="flat"
              onPress={() => fetchData()}
            >
              Recargar datos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
