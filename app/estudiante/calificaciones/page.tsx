"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Award, ArrowLeft, BookOpen, Calendar, TrendingUp, Star, BarChart3,
    Filter, ChevronDown, X, RefreshCw
} from 'lucide-react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEstudiante } from '@/app/context/EstudianteContext';

export default function CalificacionesPage() {
    const periodos = [1, 2, 3, 4];
    const router = useRouter();
    const { areas, obtenerCalificaciones, cargandoCalificaciones } = useEstudiante();
    
    // Estados principales
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState(1);
    const [areaSeleccionada, setAreaSeleccionada] = useState('todas');
    const [todasCalificaciones, setTodasCalificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [inicializado, setInicializado] = useState(false);

    // Función para cargar todas las calificaciones iniciales
    const cargarTodasCalificaciones = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!areas || areas.length === 0) {
                console.log('No hay áreas disponibles aún');
                return;
            }

            console.log('Cargando todas las calificaciones...');
            
            // Crear un mapa para almacenar todas las calificaciones
            const mapaCalificaciones = {};

            // Cargar calificaciones para todos los períodos y todas las áreas
            for (const periodo of periodos) {
                for (const area of areas) {
                    try {
                        const calificacionArea = await obtenerCalificaciones(area.id, periodo);
                        
                        if (calificacionArea && calificacionArea.notaFinal !== undefined) {
                            const key = `${area.id}-${periodo}`;
                            mapaCalificaciones[key] = {
                                ...calificacionArea,
                                area: {
                                    id: area.id,
                                    nombre: area.nombre
                                },
                                periodo: periodo
                            };
                        }
                    } catch (areaError) {
                        console.error(`Error obteniendo calificaciones para área ${area.nombre}, período ${periodo}:`, areaError);
                    }
                }
            }

            // Convertir el mapa a array
            const calificacionesArray = Object.values(mapaCalificaciones);
            
            console.log('Todas las calificaciones cargadas:', calificacionesArray);
            setTodasCalificaciones(calificacionesArray);
            setInicializado(true);

        } catch (err) {
            console.error('Error general cargando todas las calificaciones:', err);
            setError('Error al cargar las calificaciones. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Efecto para carga inicial
    useEffect(() => {
        if (areas && areas.length > 0 && !inicializado) {
            cargarTodasCalificaciones();
        }
    }, [areas, inicializado]);

    // Memo para filtrar calificaciones según los filtros seleccionados
    const calificacionesFiltradas = useMemo(() => {
        if (!todasCalificaciones || todasCalificaciones.length === 0) {
            return [];
        }

        return todasCalificaciones.filter(calificacion => {
            // Filtro por período
            const coincidePeriodo = calificacion.periodo === periodoSeleccionado;
            
            // Filtro por área
            const coincideArea = areaSeleccionada === 'todas' || 
                                calificacion.area.id === areaSeleccionada;
            
            return coincidePeriodo && coincideArea;
        });
    }, [todasCalificaciones, periodoSeleccionado, areaSeleccionada]);

    // Funciones auxiliares
    const calcularNotaFinal = (notas) => {
        if (!notas || notas.length === 0) return 0;

        // Verificar que los porcentajes sumen 100%
        const totalPorcentaje = notas.reduce((sum, nota) => sum + (nota.porcentaje || 0), 0);

        if (totalPorcentaje === 0) return 0;

        // Calcular nota final ponderada
        const notaPonderada = notas.reduce((sum, nota) => {
            const valor = nota.valor || 0;
            const porcentaje = nota.porcentaje || 0;
            return sum + (valor * porcentaje / 100);
        }, 0);

        return parseFloat(notaPonderada.toFixed(2));
    };

    const getColorByGrade = (nota) => {
        if (nota >= 4.0) return 'text-green-600 bg-green-50';
        if (nota >= 3.0) return 'text-blue-600 bg-blue-50';
        if (nota >= 2.0) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getIconByGrade = (nota) => {
        if (nota >= 4.0) return <Star className="w-5 h-5" />;
        if (nota >= 3.0) return <TrendingUp className="w-5 h-5" />;
        return <BarChart3 className="w-5 h-5" />;
    };

    const calcularPromedio = () => {
        if (calificacionesFiltradas.length === 0) return '0.0';

        const suma = calificacionesFiltradas.reduce((acc, cal) => {
            const notaFinal = calcularNotaFinal(cal.notas);
            return acc + notaFinal;
        }, 0);
        return (suma / calificacionesFiltradas.length).toFixed(1);
    };

    const obtenerEstadisticas = () => {
        if (calificacionesFiltradas.length === 0) {
            return { excelente: 0, bueno: 0, porMejorar: 0 };
        }

        return {
            excelente: calificacionesFiltradas.filter(c => calcularNotaFinal(c.notas) >= 4.0).length,
            bueno: calificacionesFiltradas.filter(c => {
                const nota = calcularNotaFinal(c.notas);
                return nota >= 3.0 && nota < 4.0;
            }).length,
            porMejorar: calificacionesFiltradas.filter(c => calcularNotaFinal(c.notas) < 3.0).length,
        };
    };

    const limpiarFiltros = () => {
        setAreaSeleccionada('todas');
        setPeriodoSeleccionado(1);
    };

    const handlePeriodoChange = (e) => {
        const nuevoPeriodo = Number(e.target.value);
        setPeriodoSeleccionado(nuevoPeriodo);
    };

    const handleAreaChange = (e) => {
        const nuevaArea = e.target.value;
        setAreaSeleccionada(nuevaArea);
    };

    const actualizarCalificaciones = async () => {
        setInicializado(false);
        await cargarTodasCalificaciones();
    };

    const goBack = () => {
        router.back();
    };

    const estadisticas = obtenerEstadisticas();

    // Estados de carga
    if (loading || cargandoCalificaciones) {
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
                        <p className="text-gray-600 mb-4">{error}</p>
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
            <div className="bg-white min-h-screen p-4">
                {/* Header */}
                <div className="max-w-4xl mx-auto mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={goBack}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-800">Mis Calificaciones</h1>
                            <p className="text-gray-600">Consulta tu rendimiento académico por área</p>
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

                    {/* Panel de Filtros */}
                    {mostrarFiltros && (
                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                    {/* Filtro por Área */}
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700 mb-2">Área</label>
                                        <select
                                            value={areaSeleccionada}
                                            onChange={handleAreaChange}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="todas">Todas las áreas</option>
                                            {areas?.map(area => (
                                                <option key={area.id} value={area.id}>
                                                    {area.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro por Período */}
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700 mb-2">Período</label>
                                        <select
                                            value={periodoSeleccionado}
                                            onChange={handlePeriodoChange}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            {periodos.map(periodo => (
                                                <option key={periodo} value={periodo}>
                                                    Período {periodo}
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
                                            ` • ${areas?.find(a => a.id === areaSeleccionada)?.nombre}`
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold">{calcularPromedio()}</div>
                                <div className="text-sm text-white text-opacity-80">Escala 1.0 - 5.0</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Calificaciones por Área */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {calificacionesFiltradas.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                No hay calificaciones disponibles
                            </h3>
                            <p className="text-gray-500">
                                No se encontraron calificaciones para los filtros seleccionados.
                            </p>
                        </div>
                    ) : (
                        calificacionesFiltradas.map((calificacion) => {
                            const notaFinalCalculada = calcularNotaFinal(calificacion.notas);

                            return (
                                <div
                                    key={`${calificacion.area.id}-${calificacion.periodo}`}
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
                                            <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${getColorByGrade(notaFinalCalculada)}`}>
                                                {getIconByGrade(notaFinalCalculada)}
                                                <span className="font-bold text-lg">{notaFinalCalculada.toFixed(1)}</span>
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
                                                        <p className="text-sm text-gray-600">Porcentaje: {nota.porcentaje.toFixed(1)}%</p>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getColorByGrade(nota.valor)}`}>
                                                        {nota.valor?.toFixed(1)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Cálculo de la Nota Final */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-700">Nota Final:</span>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-600 mb-1">
                                                        {calificacion.notas?.map((nota, index) => (
                                                            <span key={nota.id}>
                                                                {nota.valor?.toFixed(1)} × {nota.porcentaje.toFixed(1)}%
                                                                {index < calificacion.notas.length - 1 ? ' + ' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className={`text-xl font-bold ${getColorByGrade(notaFinalCalculada).split(' ')[0]}`}>
                                                        {notaFinalCalculada.toFixed(1)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer con estadísticas */}
                {calificacionesFiltradas.length > 0 && (
                    <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <div className="text-green-600 font-bold text-2xl">
                                {estadisticas.excelente}
                            </div>
                            <div className="text-green-700 text-sm">Excelente (≥ 4.0)</div>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                            <div className="text-blue-600 font-bold text-2xl">
                                {estadisticas.bueno}
                            </div>
                            <div className="text-blue-700 text-sm">Bueno (3.0-3.9)</div>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4 text-center">
                            <div className="text-yellow-600 font-bold text-2xl">
                                {estadisticas.porMejorar}
                            </div>
                            <div className="text-yellow-700 text-sm">Por Mejorar (&lt; 3.0)</div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}