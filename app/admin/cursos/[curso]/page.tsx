"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import {
  GraduationCap,
  Users,
  BookOpen,
  User,
  Eye,
  Plus,
  FileText,
  Award,
  Clock,
  Mail,
  Settings,
  BarChart3,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Search
} from "lucide-react";

import EstudiantesResponsive from "@/components/estudiantesResponsive";
import { useValidateCourseAccess } from "@/hooks/useValidateCourseAccess";
import { useAdmin } from "@/app/context/AdminContext";
import ModalNuevoEstudiante from "@/components/ui/modalNuevoEstudiante";

export default function CursoDashboard() {
  const params = useParams();
  const router = useRouter();
  const id = params.curso as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedView, setSelectedView] = useState<'overview' | 'areas' | 'students'>('overview');

  const {
    obtenerCurso,
    curso,
    actualizarPension,
    actualizarVerCalificaciones,
  } = useAdmin();

  // Efecto para cargar datos del curso
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (id) {
          await obtenerCurso(Number(id));
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
    const directorId = curso.director?.id;
    const areasDelDirector = directorId
      ? curso.areas.filter((area: any) => area.maestro.id === directorId)
      : [];

    return {
      totalEstudiantes: curso.estudiantes.length,
      totalAreas: curso.areas.length,
      totalMaestros: maestrosUnicos.size,
      areasDelDirector: areasDelDirector.length,
      porcentajeDirector:
        curso.areas.length > 0
          ? Math.round((areasDelDirector.length / curso.areas.length) * 100)
          : 0,
      promedioGeneral: 85, // Placeholder
      actividadesPendientes: 12, // Placeholder
    };
  }, [curso]);

  // Agrupar áreas por maestro
  const areasPorMaestro = useMemo(() => {
    if (!curso?.areas) return [];

    const directorId = curso.director?.id;
    const grupos = curso.areas.reduce((acc: any, area: any) => {
      const maestroId = area.maestro.id;

      if (!acc[maestroId]) {
        acc[maestroId] = {
          maestro: area.maestro,
          areas: [],
          esDirector: directorId ? maestroId === directorId : false,
        };
      }
      acc[maestroId].areas.push(area);

      return acc;
    }, {});

    return Object.values(grupos);
  }, [curso]);

  // Filtrar áreas por búsqueda
  const filteredAreas = useMemo(() => {
    if (!curso?.areas) return [];

    return curso.areas.filter((area: any) =>
      area.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.maestro.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [curso?.areas, searchTerm]);

  // Quick stats mejoradas
  const quickStats = useMemo(() => {
    if (!estadisticas) return [];

    return [
      {
        icon: Users,
        label: "Estudiantes",
        value: estadisticas.totalEstudiantes,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      },
      {
        icon: BookOpen,
        label: "Áreas Académicas",
        value: estadisticas.totalAreas,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
      {
        icon: User,
        label: "Maestros",
        value: estadisticas.totalMaestros,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      },
      {
        icon: Award,
        label: "Promedio General",
        value: `${estadisticas.promedioGeneral}%`,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      }
    ];
  }, [estadisticas]);

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

  // Loading Component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <GraduationCap className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700">Cargando curso...</h3>
        <p className="text-gray-500">Por favor espera un momento</p>
      </div>
    </div>
  );

  // Error Component
  const ErrorState = () => (
    <div className="text-center py-16 space-y-6">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-700">Error al cargar el curso</h3>
        <p className="text-gray-500 max-w-md mx-auto">{error}</p>
      </div>
      <Button
        color="danger"
        variant="flat"
        onPress={() => window.location.reload()}
      >
        Reintentar
      </Button>
    </div>
  );

  // Navigation tabs
  const navigationTabs = [
    { key: 'overview', label: 'Resumen', icon: BarChart3 },
    { key: 'areas', label: 'Áreas', icon: BookOpen },
    { key: 'students', label: 'Estudiantes', icon: Users }
  ];

  if (!shouldRender) {
    return <LoadingState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden">
        <ErrorState />
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
          <GraduationCap className="w-12 h-12 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-700">Curso no encontrado</h3>
          <p className="text-gray-500">Verifica que el ID del curso sea correcto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header del Curso */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {curso.nombre}
              </h1>
              <p className="text-gray-600 mt-1">
                Dashboard del curso • {estadisticas?.totalEstudiantes} estudiantes
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Tooltip content="Configuración del curso">
              <Button
                isIconOnly
                color="default"
                variant="flat"
                className="hover:scale-110 transition-transform"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Tooltip>
            <Tooltip content="Ver reportes">
              <Button
                color="primary"
                variant="flat"
                startContent={<FileText className="w-5 h-5" />}
                onPress={() => router.push(`/admin/cursos/${curso?.id}/calificaciones`)}
                className="hover:scale-105 transition-transform"
              >
                Reportes
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-2xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg group`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`${stat.bgColor.replace('50', '100')} p-2 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl p-2">
          <div className="flex flex-col sm:flex-row space-x-2">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedView(tab.key as any)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${selectedView === tab.key
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden">
        {selectedView === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Director Section */}
            {curso.director && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                  Director del Curso
                </h3>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {curso.director.nombre_completo}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        <Mail className="w-4 h-4" />
                        <span className="truncate w-36" title={curso.director.email}>{curso.director.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Chip color="success" size="sm" variant="flat">
                          Director de Curso
                        </Chip>
                        {estadisticas && (
                          <Chip color="primary" size="sm" variant="flat">
                            {estadisticas.areasDelDirector} áreas
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Carga Académica</div>
                      <div className="text-lg font-bold text-green-600">
                        {estadisticas?.porcentajeDirector}%
                      </div>
                    </div>
                    <Progress
                      className="w-32"
                      color="success"
                      size="sm"
                      value={estadisticas?.porcentajeDirector || 0}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Maestros Grid */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Equipo Docente ({areasPorMaestro.length} maestros)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {areasPorMaestro.map((grupo: any, index: number) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {grupo.maestro.nombre_completo}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {grupo.esDirector && (
                              <Chip color="success" size="sm" variant="dot">
                                Director
                              </Chip>
                            )}
                            <Chip color="default" size="sm" variant="flat">
                              {grupo.areas.length} área{grupo.areas.length !== 1 ? 's' : ''}
                            </Chip>
                          </div>
                        </div>
                      </div>
                      <Button
                        isIconOnly
                        color="primary"
                        size="sm"
                        variant="light"
                        onPress={() => router.push(`/admin/maestros/${grupo.maestro.id}/perfil`)}
                        className="hover:scale-110 transition-transform"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {grupo.areas.slice(0, 3).map((area: any) => (
                          <Chip
                            key={area.id}
                            color={getColorArea(area.nombre)}
                            size="sm"
                            variant="flat"
                          >
                            {area.nombre}
                          </Chip>
                        ))}
                        {grupo.areas.length > 3 && (
                          <Chip color="default" size="sm" variant="flat">
                            +{grupo.areas.length - 3}
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'areas' && (
          <div className="p-6 space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar áreas o maestros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                />
              </div>
              <Button
                color="primary"
                startContent={<Plus className="w-5 h-5" />}
                className="w-full sm:w-auto hover:scale-105 transition-transform"
              >
                Nueva Área
              </Button>
            </div>

            {/* Areas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filteredAreas.map((area: any) => (
                <div
                  key={area.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => router.push(`/admin/cursos/${curso?.id}/areas/${area.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Chip
                      color={getColorArea(area.nombre)}
                      variant="flat"
                      className="font-medium"
                    >
                      {area.nombre}
                    </Chip>
                    <div className="flex space-x-1">
                      <Button
                        isIconOnly
                        color="primary"
                        size="sm"
                        variant="light"
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/cursos/${curso?.id}/areas/${area.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        color="success"
                        size="sm"
                        variant="light"
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push(`/maestro/cursos/${curso.id}/areas/${area.id}/actividades/nueva`);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 truncate">
                        {area.maestro.nombre_completo}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Área académica</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'students' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Estudiantes del Curso ({curso.estudiantes?.length || 0})
              </h3>
              <ModalNuevoEstudiante />
            </div>

            <EstudiantesResponsive
              estudiantes={curso.estudiantes}
              handleCalificaciones={actualizarVerCalificaciones}
              handlePension={actualizarPension}
              isAdmin={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}