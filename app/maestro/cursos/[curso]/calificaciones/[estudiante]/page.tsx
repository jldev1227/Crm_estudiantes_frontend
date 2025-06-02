"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import {
  Award, ArrowLeft, BookOpen, Calendar, TrendingUp, Star, BarChart3,
  Filter, ChevronDown, X, RefreshCw, User, Phone, CreditCard
} from 'lucide-react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { OBTENER_CALIFICACIONES_ESTUDIANTE } from '@/app/graphql/queries/obtenerCalificacionesEstudiante';

export default function CalificacionesPage() {
  const periodos = [1, 2, 3, 4];
  const params = useParams();
  const router = useRouter()

  // Estados principales
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(1);
  const [areaSeleccionada, setAreaSeleccionada] = useState('todas');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Obtener estudiante_id de los parámetros de la URL
  const [estudianteId, setEstudianteId] = useState<string | null>(null);

useEffect(() => {
    const id = params.estudiante;
    
    if (typeof id === 'string') {
        setEstudianteId(id);
    } else if (Array.isArray(id) && id.length > 0) {
        setEstudianteId(id[0]);
    } else {
        setEstudianteId(null);
    }
}, [params.estudiante]);

  // Query GraphQL para obtener todas las calificaciones
  const { data, loading, error, refetch } = useQuery(OBTENER_CALIFICACIONES_ESTUDIANTE, {
    variables: {
      estudiante_id: estudianteId,
      // No pasamos area_id ni periodo para obtener todas las calificaciones
    },
    skip: !estudianteId,
    fetchPolicy: 'cache-and-network'
  });

  // Procesar datos de calificaciones
  const todasCalificaciones = useMemo(() => {
    if (!data?.obtenerCalificacionesEstudiante) return [];

    // Si el query devuelve un array, usarlo directamente
    if (Array.isArray(data.obtenerCalificacionesEstudiante)) {
      return data.obtenerCalificacionesEstudiante;
    }

    // Si devuelve un solo objeto, convertirlo a array
    return [data.obtenerCalificacionesEstudiante];
  }, [data]);

  // Obtener información del estudiante del primer registro
  const infoEstudiante = useMemo(() => {
    return todasCalificaciones.length > 0 ? todasCalificaciones[0].estudiante : null;
  }, [todasCalificaciones]);

  // Obtener áreas únicas disponibles
  const areasDisponibles = useMemo(() => {
    const areasMap = new Map();
    todasCalificaciones.forEach(cal => {
      if (cal.area) {
        areasMap.set(cal.area.id, cal.area.nombre);
      }
    });
    return Array.from(areasMap.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [todasCalificaciones]);

  // Filtrar calificaciones según período y área seleccionados
  const calificacionesFiltradas = useMemo(() => {
    return todasCalificaciones.filter(cal => {
      const coincidePeriodo = cal.periodo === periodoSeleccionado;
      const coincideArea = areaSeleccionada === 'todas' || cal.area?.id === areaSeleccionada;
      return coincidePeriodo && coincideArea;
    });
  }, [todasCalificaciones, periodoSeleccionado, areaSeleccionada]);

  // Funciones auxiliares
  const obtenerColorNota = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600 bg-green-50';
    if (nota >= 3.5) return 'text-blue-600 bg-blue-50';
    if (nota >= 3.0) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const obtenerDesempeno = (nota: number) => {
    if (nota >= 4.5) return 'Superior';
    if (nota >= 3.5) return 'Alto';
    if (nota >= 3.0) return 'Básico';
    return 'Bajo';
  };

  const getIconByGrade = (nota: number) => {
    if (nota >= 4.0) return <Star className="w-5 h-5" />;
    if (nota >= 3.0) return <TrendingUp className="w-5 h-5" />;
    return <BarChart3 className="w-5 h-5" />;
  };

  // Calcular promedio general
  const promedioGeneral = useMemo(() => {
    const notasConValor = calificacionesFiltradas.filter(cal => cal.notaFinal > 0);
    if (notasConValor.length === 0) return 0;
    const suma = notasConValor.reduce((acc, cal) => acc + cal.notaFinal, 0);
    return (suma / notasConValor.length).toFixed(2);
  }, [calificacionesFiltradas]);

  // Obtener estadísticas
  const obtenerEstadisticas = () => {
    if (calificacionesFiltradas.length === 0) {
      return { excelente: 0, bueno: 0, porMejorar: 0 };
    }

    return {
      excelente: calificacionesFiltradas.filter(c => c.notaFinal >= 4.0).length,
      bueno: calificacionesFiltradas.filter(c => c.notaFinal >= 3.0 && c.notaFinal < 4.0).length,
      porMejorar: calificacionesFiltradas.filter(c => c.notaFinal < 3.0).length,
    };
  };

  const limpiarFiltros = () => {
    setAreaSeleccionada('todas');
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
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
              <BookOpen size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={actualizarCalificaciones}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
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
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Award className="text-primary-500" size={28} />
                    Calificaciones
                  </h1>
                  {infoEstudiante && (
                    <p className="text-gray-600 text-sm">
                      {infoEstudiante.nombre_completo} - {infoEstudiante.numero_identificacion}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                <Filter size={20} />
                Filtros
                <ChevronDown
                  size={16}
                  className={`transform transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Información del estudiante */}
          {infoEstudiante && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} />
                Información del Estudiante
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nombre Completo</p>
                    <p className="font-medium text-gray-800">{infoEstudiante.nombre_completo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CreditCard size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Documento</p>
                    <p className="font-medium text-gray-800">
                      {infoEstudiante.tipo_documento} - {infoEstudiante.numero_identificacion}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Phone size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono Padres</p>
                    <p className="font-medium text-gray-800">{infoEstudiante.celular_padres}</p>
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
                    <label className="text-sm font-medium text-gray-700 mb-2">Período</label>
                    <select
                      value={periodoSeleccionado}
                      onChange={(e) => setPeriodoSeleccionado(parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {periodos.map(periodo => (
                        <option key={periodo} value={periodo}>
                          Período {periodo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Área */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">Área</label>
                    <select
                      value={areaSeleccionada}
                      onChange={(e) => setAreaSeleccionada(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="todas">Todas las áreas</option>
                      {areasDisponibles.map(area => (
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
                    onClick={limpiarFiltros}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X size={16} />
                    Limpiar
                  </button>
                  <button
                    onClick={actualizarCalificaciones}
                    className="flex items-center gap-2 px-3 py-2 text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                    disabled={loading}
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
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
                  <Award size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Promedio General</h2>
                  <p className="text-white text-opacity-80">
                    Período {periodoSeleccionado}
                    {areaSeleccionada !== 'todas' &&
                      ` • ${areasDisponibles.find(a => a.id === areaSeleccionada)?.nombre}`
                    }
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{promedioGeneral}</div>
                <div className="text-sm text-white text-opacity-80">Escala 1.0 - 5.0</div>
              </div>
            </div>
          </div>

          {/* Lista de Calificaciones */}
          <div className="space-y-4">
            {calificacionesFiltradas.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No hay calificaciones disponibles
                </h3>
                <p className="text-gray-500">
                  No se encontraron calificaciones para los filtros seleccionados.
                </p>
              </div>
            ) : (
              calificacionesFiltradas.map((calificacion) => (
                <div
                  key={calificacion.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-500 bg-opacity-10 rounded-full p-2">
                          <BookOpen size={20} className="text-primary-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{calificacion.area?.nombre}</h3>
                          <p className="text-sm text-gray-600">
                            {calificacion.grado?.nombre} • Período {calificacion.periodo}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${obtenerColorNota(calificacion.notaFinal)}`}>
                        {getIconByGrade(calificacion.notaFinal)}
                        <span className="font-bold text-lg">
                          {calificacion.notaFinal > 0 ? calificacion.notaFinal.toFixed(1) : 'S/N'}
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
                            <p className="font-medium text-gray-800">{nota.nombre}</p>
                            <p className="text-sm text-gray-600">
                              Porcentaje: {nota.porcentaje?.toFixed(1)}% • {nota.actividad_id}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${obtenerColorNota(nota.valor)}`}>
                            {nota.valor > 0 ? nota.valor.toFixed(1) : 'S/N'}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resumen de la nota final */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">Nota Final:</span>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${obtenerColorNota(calificacion.notaFinal).split(' ')[0]}`}>
                            {calificacion.notaFinal > 0 ? calificacion.notaFinal.toFixed(1) : 'Sin Nota'}
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
                <div className="text-green-700 text-sm font-medium">Excelente (≥ 4.0)</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-blue-600 font-bold text-3xl mb-2">
                  {estadisticas.bueno}
                </div>
                <div className="text-blue-700 text-sm font-medium">Bueno (3.0-3.9)</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-red-600 font-bold text-3xl mb-2">
                  {estadisticas.porMejorar}
                </div>
                <div className="text-red-700 text-sm font-medium">Por Mejorar (&lt; 3.0)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}