"use client";

import React, { useEffect, useMemo } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { useRouter } from "next/navigation";
import { GraduationCap, Users, BookOpen, Settings } from "lucide-react";
import { useAdmin } from "@/app/context/AdminContext";
import { Curso } from "@/types";

// Iconos como componentes
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25H11.69Z" />
  </svg>
);

export default function Page() {
  const router = useRouter();
  const { cursos, obtenerCursos } = useAdmin(); // Cambiado de cursos a cursos

  useEffect(() => {
    obtenerCursos(); // Cambiado de obtenerCursos a obtenerCursos
  }, []);

  // Estadísticas de cursos
  const estadisticasGrados = useMemo(() => {
    if (!cursos) return {
      totalGrados: 0,
      gradosConDirector: 0,
      gradosSinDirector: 0
    };

    return {
      totalGrados: cursos.length,
      gradosConDirector: cursos.filter(g => g.director).length,
      gradosSinDirector: cursos.filter(g => !g.director).length
    };
  }, [cursos]);

  // Funciones de navegación
  const verGrado = (gradoId: string) => {
    router.push(`/admin/cursos/${gradoId}`);
  };

  // Obtener color para el chip según el estado del grado
  const getColorEstado = (grado: Curso) => {
    if (!grado.director) return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl uppercase font-bold text-blue-600">
          Gestión de Grados
        </h1>
        <p className="text-gray-600">
          Administra todos los cursos de la institución, asigna directores y supervisa el progreso académico
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {estadisticasGrados.totalGrados}
          </div>
          <div className="text-sm text-blue-600">Total de Grados</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {estadisticasGrados.gradosConDirector}
          </div>
          <div className="text-sm text-green-600">Con Director Asignado</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">
            {estadisticasGrados.gradosSinDirector}
          </div>
          <div className="text-sm text-orange-600">Sin Director</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round((estadisticasGrados.gradosConDirector / estadisticasGrados.totalGrados) * 100) || 0}%
          </div>
          <div className="text-sm text-purple-600">Cobertura Directores</div>
        </div>
      </div>

      {/* Cards por Grado */}
      <div className="space-y-6">
        {cursos?.map((grado) => (
          <Card key={grado.id} className="w-full shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {grado.nombre.toUpperCase()}
                    </h3>
                    <Chip 
                      size="sm" 
                      color={getColorEstado(grado)} 
                      variant="flat" 
                      className="font-medium mt-1"
                    >
                      {grado.director ? 'Director Asignado' : 'Sin Director'}
                    </Chip>
                    <div className="flex items-center gap-2 mt-2">
                      {grado.director ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Director:</span>
                          <Chip size="sm" color="primary" variant="flat">
                            {grado.director.nombre_completo}
                          </Chip>
                        </div>
                      ) : (
                        <span className="text-sm text-orange-600 font-medium">
                          ⚠️ Requiere asignación de director
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones principales del grado */}
                <div className="flex items-center gap-2">
                  <Tooltip content="Ver grado completo">
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      isIconOnly
                      onPress={() => verGrado(grado.id)}
                    >
                      <GraduationCap strokeWidth={1} />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>

            <Divider />
          </Card>
        ))}
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
                No hay cursos registrados
              </h3>
              <p className="text-sm text-gray-600">
                Comienza creando los cursos de la institución educativa
              </p>
              <Button 
                color="primary" 
                className="mt-4"
                onPress={() => router.push('/admin/cursos/crear')}
              >
                Crear Primer Grado
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}