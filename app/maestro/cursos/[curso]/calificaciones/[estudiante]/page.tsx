"use client";
import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import {
  Award,
  ArrowLeft,
  BookOpen,
  Calendar,
  TrendingUp,
  Star,
  BarChart3,
  Filter,
  ChevronDown,
  X,
  RefreshCw,
  User,
  Phone,
  CreditCard,
  ArmchairIcon,
  Circle,
  Target,
} from "lucide-react";
import { Button } from "@heroui/button";

import ProtectedRoute from "@/components/ProtectedRoute";
import { OBTENER_CALIFICACIONES_ESTUDIANTE } from "@/app/graphql/queries/obtenerCalificacionesEstudiante";
import { Area, Calificacion, Grado, Maestro } from "@/types";
import { handleGenerateEstudiantePDF } from "@/components/ui/reporte";

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

interface Indicador {
  id: string | number;
  nombre: string;
  periodo: number;
  grado_id: number;
  area_id: number;
  // Relaciones opcionales
  grado?: Grado;
  area?: Area;
  // Timestamps (si están habilitados en Sequelize)
  createdAt?: Date;
  updatedAt?: Date;
}

export default function CalificacionesPage() {
  const periodos = [1, 2, 3, 4];
  const params = useParams();
  const router = useRouter();

  // Estados principales
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(1);
  const [areaSeleccionada, setAreaSeleccionada] = useState<string | number>(
    "todas",
  );
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [director, setDirector] = useState<Maestro | null>(null);

  // Query GraphQL para obtener todas las calificaciones
  const { data, loading, error, refetch } = useQuery(
    OBTENER_CALIFICACIONES_ESTUDIANTE,
    {
      variables: {
        estudiante_id: params.estudiante,
        grado_id: params.curso,
        periodo: periodoSeleccionado,
      },
      skip: !params.estudiante,
      fetchPolicy: "cache-and-network",
    },
  );

  // Procesar datos de calificaciones
  const todasCalificaciones = useMemo(() => {
    if (!data?.obtenerCalificacionesEstudiante) return [];

    console.log(data.obtenerCalificacionesEstudiante);

    const director =
      data.obtenerCalificacionesEstudiante.estudiante.grado.director;

    if (director) {
      setDirector(director);
    }

    // Si el query devuelve un array, usarlo directamente
    if (Array.isArray(data.obtenerCalificacionesEstudiante.calificaciones)) {
      return data.obtenerCalificacionesEstudiante.calificaciones;
    }

    // Si devuelve un solo objeto, convertirlo a array
    return [data.obtenerCalificacionesEstudiante.calificaciones];
  }, [data]);

  // ✅ Opcional: Proteger contra arrays undefined
  const calificacionesFiltradas = useMemo(() => {
    if (!todasCalificaciones || todasCalificaciones.length === 0) return [];

    return todasCalificaciones.filter((cal: Calificacion) => {
      const coincidePeriodo = cal.periodo === periodoSeleccionado;
      const coincideArea =
        areaSeleccionada === "todas" || cal.area?.id === areaSeleccionada;

      return coincidePeriodo && coincideArea;
    });
  }, [todasCalificaciones, periodoSeleccionado, areaSeleccionada]);

  // ✅ Opcional: Proteger el cálculo del promedio
  const promedioGeneral = useMemo(() => {
    if (!calificacionesFiltradas || calificacionesFiltradas.length === 0)
      return "0.00";

    const notasConValor = calificacionesFiltradas.filter(
      (cal: Calificacion) => cal.notaFinal > 0,
    );

    if (notasConValor.length === 0) return "0.00";

    const suma = notasConValor.reduce(
      (acc: number, cal: Calificacion) => acc + cal.notaFinal,
      0,
    );

    return (suma / notasConValor.length).toFixed(2);
  }, [calificacionesFiltradas]);

  // Obtener áreas únicas disponibles
  const areasDisponibles = useMemo(() => {
    const areasMap = new Map();

    todasCalificaciones.forEach((cal: Calificacion) => {
      if (cal.area) {
        areasMap.set(cal.area.id, cal.area.nombre);
      }
    });

    return Array.from(areasMap.entries()).map(([id, nombre]) => ({
      id,
      nombre,
    }));
  }, [todasCalificaciones]);

  // Funciones auxiliares
  const obtenerColorNota = (nota: number) => {
    if (nota >= 4.5) return "text-green-600 bg-green-50";
    if (nota >= 3.5) return "text-blue-600 bg-blue-50";
    if (nota >= 3.0) return "text-yellow-600 bg-yellow-50";

    return "text-red-600 bg-red-50";
  };

  const obtenerDesempeno = (nota: number) => {
    if (nota >= 4.5) return "Superior";
    if (nota >= 3.5) return "Alto";
    if (nota >= 3.0) return "Básico";

    return "Bajo";
  };

  const getIconByGrade = (nota: number) => {
    if (nota >= 4.0) return <Star className="w-5 h-5" />;
    if (nota >= 3.0) return <TrendingUp className="w-5 h-5" />;

    return <BarChart3 className="w-5 h-5" />;
  };

  // Obtener estadísticas
  const obtenerEstadisticas = () => {
    if (calificacionesFiltradas.length === 0) {
      return { excelente: 0, bueno: 0, porMejorar: 0 };
    }

    return {
      excelente: calificacionesFiltradas.filter(
        (c: Calificacion) => c.notaFinal >= 4.0,
      ).length,
      bueno: calificacionesFiltradas.filter(
        (c: Calificacion) => c.notaFinal >= 3.0 && c.notaFinal < 4.0,
      ).length,
      porMejorar: calificacionesFiltradas.filter(
        (c: Calificacion) => c.notaFinal < 3.0,
      ).length,
    };
  };

  const limpiarFiltros = () => {
    setAreaSeleccionada("todas");
    setPeriodoSeleccionado(1);
  };

  const actualizarCalificaciones = () => {
    refetch();
  };

  const estadisticas = obtenerEstadisticas();

  // Estados de carga y error
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
            <p className="text-gray-600">Cargando calificaciones...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <BookOpen className="mx-auto" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Error al cargar
            </h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              onClick={actualizarCalificaciones}
            >
              Reintentar
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => router.back()}
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Award className="text-primary-500" size={28} />
                    Calificaciones
                  </h1>
                </div>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <Filter size={20} />
                Filtros
                <ChevronDown
                  className={`transform transition-transform ${mostrarFiltros ? "rotate-180" : ""}`}
                  size={16}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Información del estudiante */}
          {data.obtenerCalificacionesEstudiante.estudiante && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User size={20} />
                  Información del Estudiante
                </h2>
                <Button
                  color="warning"
                  variant="flat"
                  onPress={() =>
                    handleGenerateEstudiantePDF(
                      data.obtenerCalificacionesEstudiante.estudiante, // ✅ Objeto estudiante completo
                      todasCalificaciones, // ✅ Array de calificaciones (puede estar vacío)
                      director, // ✅ Objeto director (puede ser null)
                      periodoSeleccionado, // ✅ Período seleccionado
                      data.obtenerCalificacionesEstudiante.puesto.posicion,
                      data.obtenerCalificacionesEstudiante.indicadores, // ✅ Indicadores
                    )
                  }
                >
                  <DocumentIcon />
                  Descargar Boletin
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nombre Completo</p>
                    <p className="font-medium text-gray-800">
                      {
                        data.obtenerCalificacionesEstudiante.estudiante
                          .nombre_completo
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CreditCard className="text-green-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Documento</p>
                    <p className="font-medium text-gray-800">
                      {
                        data.obtenerCalificacionesEstudiante.estudiante
                          .tipo_documento
                      }{" "}
                      -{" "}
                      {
                        data.obtenerCalificacionesEstudiante.estudiante
                          .numero_identificacion
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Phone className="text-purple-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono Padres</p>
                    <p className="font-medium text-gray-800">
                      {
                        data.obtenerCalificacionesEstudiante.estudiante
                          .celular_padres
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <ArmchairIcon className="text-amber-600" size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Puesto</p>
                    <p className="font-medium text-gray-800">
                      {data.obtenerCalificacionesEstudiante.puesto.posicion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Panel de Filtros */}
          {mostrarFiltros && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Filtro por Período */}
                  <div className="flex flex-col">
                    <label
                      className="text-sm font-medium text-gray-700 mb-2"
                      htmlFor="periodo"
                    >
                      Período
                    </label>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      id="periodo"
                      value={periodoSeleccionado}
                      onChange={(e) =>
                        setPeriodoSeleccionado(parseInt(e.target.value))
                      }
                    >
                      {periodos.map((periodo) => (
                        <option key={periodo} value={periodo}>
                          Período {periodo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Área */}
                  <div className="flex flex-col">
                    <label
                      className="text-sm font-medium text-gray-700 mb-2"
                      htmlFor="area"
                    >
                      Área
                    </label>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      id="area"
                      value={areaSeleccionada}
                      onChange={(e) => setAreaSeleccionada(e.target.value)}
                    >
                      <option value="todas">Todas las áreas</option>
                      {areasDisponibles.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={limpiarFiltros}
                  >
                    <X size={16} />
                    Limpiar
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                    disabled={loading}
                    onClick={actualizarCalificaciones}
                  >
                    <RefreshCw
                      className={loading ? "animate-spin" : ""}
                      size={16}
                    />
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resumen General */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <Award className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Promedio General</h2>
                  <p className="text-white text-opacity-80">
                    Período {periodoSeleccionado}
                    {areaSeleccionada !== "todas" &&
                      ` • ${areasDisponibles.find((a) => a.id === areaSeleccionada)?.nombre}`}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{promedioGeneral}</div>
                <div className="text-sm text-white text-opacity-80">
                  Escala 1.0 - 5.0
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Calificaciones */}
          <div className="space-y-4">
            {calificacionesFiltradas.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <BookOpen className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No hay calificaciones disponibles
                </h3>
                <p className="text-gray-500">
                  No se encontraron calificaciones para los filtros
                  seleccionados.
                </p>
              </div>
            ) : (
              calificacionesFiltradas.map((calificacion: Calificacion) => (
                <div
                  key={calificacion.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-500 bg-opacity-10 rounded-full p-2">
                          <BookOpen className="text-primary-500" size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {calificacion.area?.nombre}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {calificacion.grado?.nombre} • Período{" "}
                            {calificacion.periodo}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-full ${obtenerColorNota(calificacion.notaFinal)}`}
                      >
                        {getIconByGrade(calificacion.notaFinal)}
                        <span className="font-bold text-lg">
                          {calificacion.notaFinal > 0
                            ? calificacion.notaFinal.toFixed(1)
                            : "S/N"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar size={16} />
                      Evaluaciones del Período
                    </h4>
                    <div className="space-y-3">
                      {calificacion.notas?.map((nota) => (
                        <div
                          key={nota.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {nota.nombre}
                            </p>
                            <p className="text-sm text-gray-600">
                              Porcentaje: {nota.porcentaje?.toFixed(1)}% •{" "}
                              {nota.actividad_id}
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${obtenerColorNota(nota.valor)}`}
                          >
                            {nota.valor > 0 ? nota.valor.toFixed(1) : "S/N"}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* SECCIÓN CORREGIDA: Indicadores de Evaluación */}
                    {(() => {
                      // Filtrar indicadores específicos para esta área y período
                      const indicadoresArea =
                        data.obtenerCalificacionesEstudiante.indicadores.lista.filter(
                          (indicador: Indicador) =>
                            indicador.area_id === calificacion.area_id &&
                            indicador.periodo === calificacion.periodo,
                        );

                      return (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Target size={16} />
                            Indicadores de Logros ({indicadoresArea.length})
                          </h4>

                          {indicadoresArea.length > 0 ? (
                            <div className="grid gap-2">
                              {indicadoresArea.map(
                                (indicador: Indicador, index: number) => (
                                  <div
                                    key={indicador.id}
                                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100"
                                  >
                                    <div className="flex-shrink-0 mt-1">
                                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-medium text-blue-600">
                                          {index + 1}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-800">
                                        {indicador.nombre}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        Período {indicador.periodo} •{" "}
                                        {calificacion.area?.nombre}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <Circle
                                        className="text-blue-400"
                                        size={16}
                                      />
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-500">
                              <Target size={16} />
                              <span className="text-sm">
                                No hay indicadores registrados para esta área en
                                el período {calificacion.periodo}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Resumen de la nota final */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">
                          Nota Final:
                        </span>
                        <div className="text-right">
                          <div
                            className={`text-xl font-bold ${obtenerColorNota(calificacion.notaFinal).split(" ")[0]}`}
                          >
                            {calificacion.notaFinal > 0
                              ? calificacion.notaFinal.toFixed(1)
                              : "Sin Nota"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {obtenerDesempeno(calificacion.notaFinal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer con estadísticas */}
          {calificacionesFiltradas.length > 0 && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-green-600 font-bold text-3xl mb-2">
                  {estadisticas.excelente}
                </div>
                <div className="text-green-700 text-sm font-medium">
                  Excelente (≥ 4.0)
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-blue-600 font-bold text-3xl mb-2">
                  {estadisticas.bueno}
                </div>
                <div className="text-blue-700 text-sm font-medium">
                  Bueno (3.0-3.9)
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-red-600 font-bold text-3xl mb-2">
                  {estadisticas.porMejorar}
                </div>
                <div className="text-red-700 text-sm font-medium">
                  Por Mejorar (&lt; 3.0)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
