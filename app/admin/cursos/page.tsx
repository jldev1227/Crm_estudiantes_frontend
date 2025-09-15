"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Card, CardHeader } from "@heroui/card";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  UserCheck,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Search,
  Award,
} from "lucide-react";

import { useAdmin } from "@/app/context/AdminContext";
import { Curso } from "@/types";
import { useMediaQuery } from "react-responsive";
import { Input } from "@heroui/input";

export default function Page() {
  const router = useRouter();
  const { cursos, obtenerCursos } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useMediaQuery({ maxWidth: 640 });

  useEffect(() => {
    obtenerCursos();
  }, []);

  // Filtrar cursos por búsqueda
  const filteredCursos = useMemo(() => {
    if (!cursos) return [];

    return cursos.filter(curso =>
      curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.director?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cursos, searchTerm]);

  // Estadísticas de cursos
  const estadisticasGrados = useMemo(() => {
    if (!cursos) return {
      totalGrados: 0,
      gradosConDirector: 0,
      gradosSinDirector: 0,
      cobertura: 0
    };

    const gradosConDirector = cursos.filter((g) => g.director).length;
    const totalGrados = cursos.length;

    return {
      totalGrados,
      gradosConDirector,
      gradosSinDirector: totalGrados - gradosConDirector,
      cobertura: totalGrados > 0 ? Math.round((gradosConDirector / totalGrados) * 100) : 0
    };
  }, [cursos]);

  const quickStats = [
    {
      icon: GraduationCap,
      label: "Total Grados",
      value: estadisticasGrados.totalGrados,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: UserCheck,
      label: "Con Director",
      value: estadisticasGrados.gradosConDirector,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      icon: AlertTriangle,
      label: "Sin Director",
      value: estadisticasGrados.gradosSinDirector,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      icon: Award,
      label: "Cobertura",
      value: `${estadisticasGrados.cobertura}%`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  // Funciones de navegación
  const verGrado = (gradoId: number) => {
    router.push(`/admin/cursos/${gradoId}`);
  };

  // Obtener color para el chip según el estado del grado
  const getColorEstado = (grado: Curso) => {
    if (!grado.director) return "warning";
    return "success";
  };

  const EmptyState = () => (
    <div className="text-center py-16 space-y-6">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
        <GraduationCap className="w-12 h-12 text-blue-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-700">No hay cursos registrados</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Comienza creando los cursos de la institución educativa para organizar
          el sistema académico.
        </p>
      </div>
      <Button
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/25"
        startContent={<Plus className="w-5 h-5" />}
      >
        Crear Primer Curso
      </Button>
    </div>
  );

  const CourseCard = ({ grado }: { grado: Curso }) => (
    <Card isPressable={isMobile} onPress={() => verGrado(grado.id)}
      shadow={isMobile ? "none" : "sm"} className="w-full bg-white hover:bg-white/90 transition-all duration-300 bg-white/60 backdrop-blur-sm border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start w-full">
          <div className="flex items-start gap-4 flex-1">
            <div className={`hidden w-12 h-12 rounded-2xl sm:flex items-center justify-center ${grado.director ? 'bg-green-100' : 'bg-orange-100'
              }`}>
              <GraduationCap className={`w-6 h-6 ${grado.director ? 'text-green-600' : 'text-orange-600'
                }`} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-800 truncate">
                {grado.nombre.toUpperCase()}
              </h3>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Chip
                  className="font-medium"
                  color={getColorEstado(grado)}
                  size="sm"
                  variant="flat"
                >
                  {grado.director ? "Director Asignado" : "Sin Director"}
                </Chip>

                {grado.director && (
                  <Chip color="primary" size="sm" variant="flat">
                    {grado.director.nombre_completo}
                  </Chip>
                )}
              </div>

              {!grado.director && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-600 font-medium">
                    Requiere asignación de director
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 ml-4">
            <Tooltip content="Ver detalles">
              <Button
                isIconOnly
                color="primary"
                size="sm"
                variant="flat"
                onPress={() => verGrado(grado.id)}
                className="hover:scale-110 transition-transform"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Editar curso">
              <Button
                isIconOnly
                color="default"
                size="sm"
                variant="flat"
                className="hover:scale-110 transition-transform"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  const ListView = () => (
    <div className="space-y-3">
      {filteredCursos.map((grado) => (
        <CourseCard key={grado.id} grado={grado} />
      ))}
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {filteredCursos.map((grado) => (
        <CourseCard key={grado.id} grado={grado} />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Gestión de Cursos
            </h1>
            <p className="text-gray-600 mt-1">
              Administra todos los cursos, asigna directores y supervisa el progreso académico
            </p>
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
                <div className="text-right">
                  <div className={`text-xl lg:text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search and Controls */}
        <div className="bg-white/60 backdrop-blur-sm sm:border sm:border-gray-200 rounded-2xl sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full max-w-md">
              <Input
                startContent={<Search className="w-5 h-5 text-gray-400" />}
                type="text"
                placeholder="Buscar cursos o directores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Button
                fullWidth={isMobile}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/25"
                onPress={() => router.push("/admin/cursos/crear")}
                startContent={<Plus className="w-5 h-5" />}
              >
                <span className="hidden sm:inline">Nuevo Curso</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white/60 backdrop-blur-sm sm:border sm:border-gray-200 rounded-2xl overflow-hidden">
        {(!cursos || cursos.length === 0) ? (
          <EmptyState />
        ) : filteredCursos.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Search className="w-16 h-16 text-gray-300 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">No se encontraron resultados</h3>
              <p className="text-gray-500">
                No hay cursos que coincidan con "{searchTerm}"
              </p>
            </div>
            <Button
              color="primary"
              variant="light"
              onPress={() => setSearchTerm("")}
            >
              Limpiar búsqueda
            </Button>
          </div>
        ) : (
          <div className="sm:p-6">
            {searchTerm && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-700">
                  <span className="font-medium">
                    {filteredCursos.length} resultado(s) encontrado(s)
                  </span>
                  {searchTerm && (
                    <span> para "{searchTerm}"</span>
                  )}
                </p>
              </div>
            )}

            {!isMobile ? <GridView /> : <ListView />}
          </div>
        )}
      </div>
    </div>
  );
}