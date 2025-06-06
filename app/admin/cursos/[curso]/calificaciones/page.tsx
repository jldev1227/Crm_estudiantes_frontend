"use client";
import React, { useCallback, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Select, SelectItem } from "@heroui/select";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";
import { Spinner } from "@heroui/spinner";
import {
  ArrowLeft,
  Download,
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  FileText,
  Eye,
  BarChart3,
} from "lucide-react";
import { SharedSelection } from "@heroui/system";

import { useAdmin } from "@/app/context/AdminContext";
import { Nota } from "@/types";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const grado_id = params?.curso as string;

  const {
    calificacionesGrado, // Cambiado: para calificacionesGrado completas del grado
    establecerPeriodo,
    periodoSeleccionado,
    obtenerCalificaciones, // Nueva función para obtener todas las áreas
  } = useAdmin();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Efecto para cargar datos del grado completo
  const fetchData = useCallback(async () => {
    // Solo necesitamos grado_id (eliminamos area_id)
    if (!grado_id) return;

    setLoading(true);
    setError("");

    try {
      // Cargar calificacionesGrado de todas las áreas del grado
      await obtenerCalificaciones(Number(grado_id), periodoSeleccionado);
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

  // Manejar cambio de período
  const handlePeriodoChange = (keys: SharedSelection) => {
    const key = Array.from(keys)[0] as string;

    establecerPeriodo(parseInt(key));
  };

  // Obtener color según la nota
  const getNotaColor = (nota: number): "success" | "warning" | "danger" => {
    if (nota >= 3.5) return "success";
    if (nota >= 3.0) return "warning";

    return "danger";
  };

  // Obtener color según el estado
  const getEstadoColor = (estado: string): "success" | "danger" | "default" => {
    switch (estado) {
      case "APROBADO":
        return "success";
      case "REPROBADO":
        return "danger";
      default:
        return "default";
    }
  };

  if (loading && !calificacionesGrado) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center w-full">
            <div>
              <h1 className="text-xl md:text-2xl uppercase font-bold text-blue-600">
                {calificacionesGrado?.grado?.nombre} /{" "}
                {calificacionesGrado?.area?.nombre}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Chip color="primary" size="sm" variant="flat">
                  <Users className="w-3 h-3 mr-1" />
                  {calificacionesGrado?.estadisticas?.total_estudiantes ||
                    0}{" "}
                  estudiantes
                </Chip>
                <Chip color="secondary" size="sm" variant="flat">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {calificacionesGrado?.actividades?.length || 0} actividades
                </Chip>
                <Chip color="success" size="sm" variant="flat">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {calificacionesGrado?.estadisticas?.porcentaje_aprobacion ||
                    0}
                  % aprobación
                </Chip>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select
                className="w-32"
                label="Periodo"
                selectedKeys={[periodoSeleccionado.toString()]}
                size="sm"
                variant="bordered"
                onSelectionChange={handlePeriodoChange}
              >
                <SelectItem key="1">Periodo 1</SelectItem>
                <SelectItem key="2">Periodo 2</SelectItem>
                <SelectItem key="3">Periodo 3</SelectItem>
                <SelectItem key="4">Periodo 4</SelectItem>
              </Select>
              <Button
                color="primary"
                size="sm"
                startContent={<ArrowLeft className="w-4 h-4" />}
                variant="flat"
                onPress={() => router.back()}
              >
                Volver
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alertas y Mensajes */}
      {error && (
        <Card className="border border-red-200 bg-red-50">
          <CardBody className="py-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {(calificacionesGrado?.estadisticas?.sin_calificar || 0) > 0 && (
        <Card className="border border-yellow-200 bg-yellow-50">
          <CardBody className="py-3">
            <div className="flex items-start gap-2 text-yellow-700">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">
                  {calificacionesGrado?.estadisticas.sin_calificar} estudiantes
                  sin calificar
                </p>
                <p className="text-sm mt-1">
                  Los estudiantes sin notas aparecerán como Sin Calificar
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Estadísticas Generales */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 w-full">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Estadísticas del Período
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Resumen del rendimiento académico del curso
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                color="success"
                size="sm"
                startContent={<Download className="w-4 h-4" />}
                variant="flat"
              >
                Exportar Datos
              </Button>
            </div>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Promedio General */}
            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-blue-600" size={20} />
                <div>
                  <span className="text-xs text-gray-600">
                    Promedio General
                  </span>
                  <p className="font-bold text-lg text-blue-600">
                    {calificacionesGrado?.estadisticas?.promedio_area?.toFixed(
                      1,
                    ) || "0.0"}
                  </p>
                </div>
              </div>
            </div>

            {/* Aprobados */}
            <div className="p-4 rounded-lg border bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-green-600" size={20} />
                <div>
                  <span className="text-xs text-gray-600">Aprobados</span>
                  <p className="font-bold text-lg text-green-600">
                    {calificacionesGrado?.estadisticas?.aprobados || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Reprobados */}
            <div className="p-4 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <div>
                  <span className="text-xs text-gray-600">Reprobados</span>
                  <p className="font-bold text-lg text-red-600">
                    {calificacionesGrado?.estadisticas?.reprobados || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Calificados */}
            <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
              <div className="flex items-center gap-3">
                <Users className="text-purple-600" size={20} />
                <div>
                  <span className="text-xs text-gray-600">Calificados</span>
                  <p className="font-bold text-lg text-purple-600">
                    {calificacionesGrado?.estadisticas?.calificados || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Distribución de Notas */}
          {calificacionesGrado?.estadisticas?.distribucion_notas && (
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-3 text-gray-700">
                Distribución de Notas
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                <div className="bg-green-100 p-2 rounded border text-center">
                  <span className="text-xs text-gray-600">
                    Excelente (4.5-5.0)
                  </span>
                  <p className="font-semibold text-green-700">
                    {
                      calificacionesGrado.estadisticas.distribucion_notas
                        .excelente
                    }
                  </p>
                </div>
                <div className="bg-blue-100 p-2 rounded border text-center">
                  <span className="text-xs text-gray-600">
                    Sobresaliente (4.0-4.4)
                  </span>
                  <p className="font-semibold text-blue-700">
                    {
                      calificacionesGrado.estadisticas.distribucion_notas
                        .sobresaliente
                    }
                  </p>
                </div>
                <div className="bg-yellow-100 p-2 rounded border text-center">
                  <span className="text-xs text-gray-600">
                    Aceptable (3.5-3.9)
                  </span>
                  <p className="font-semibold text-yellow-700">
                    {
                      calificacionesGrado.estadisticas.distribucion_notas
                        .aceptable
                    }
                  </p>
                </div>
                <div className="bg-orange-100 p-2 rounded border text-center">
                  <span className="text-xs text-gray-600">
                    Insuficiente (3.0-3.4)
                  </span>
                  <p className="font-semibold text-orange-700">
                    {
                      calificacionesGrado.estadisticas.distribucion_notas
                        .insuficiente
                    }
                  </p>
                </div>
                <div className="bg-red-100 p-2 rounded border text-center">
                  <span className="text-xs text-gray-600">
                    Deficiente (1.0-2.9)
                  </span>
                  <p className="font-semibold text-red-700">
                    {
                      calificacionesGrado.estadisticas.distribucion_notas
                        .deficiente
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tabla de Calificaciones */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Calificaciones por Estudiante
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Vista detallada de las calificacionesGrado de cada estudiante
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Chip color="primary" size="sm" variant="flat">
                {calificacionesGrado?.estudiantes?.length || 0} registros
              </Chip>
            </div>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="pt-4">
          {calificacionesGrado?.estudiantes &&
          calificacionesGrado?.estudiantes?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table
                isHeaderSticky
                removeWrapper
                aria-label="Tabla de calificacionesGrado"
                classNames={{
                  base: "max-h-[600px]",
                  table: "min-h-[150px]",
                  th: "bg-gray-50 text-gray-700 font-semibold",
                }}
              >
                <TableHeader>
                  <TableColumn className="min-w-[200px]">
                    ESTUDIANTE
                  </TableColumn>
                  <TableColumn className="text-center">DOCUMENTO</TableColumn>
                  <TableColumn className="text-center">NOTA FINAL</TableColumn>
                  <TableColumn className="text-center">ESTADO</TableColumn>
                  <TableColumn className="text-center">
                    CALIFICACIONES
                  </TableColumn>
                  <TableColumn className="text-center">ACCIONES</TableColumn>
                </TableHeader>
                <TableBody>
                  {calificacionesGrado.estudiantes.map((estudiante) => (
                    <TableRow key={estudiante.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">
                            {estudiante.nombre_completo}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {estudiante.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm">
                          <p>{estudiante.tipo_documento}</p>
                          <p className="text-gray-500">
                            {estudiante.numero_identificacion}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Chip
                          color={getNotaColor(estudiante.nota_final || 0)}
                          size="sm"
                          variant="flat"
                        >
                          {estudiante.nota_final?.toFixed(1) || "0.0"}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-center">
                        <Chip
                          color={getEstadoColor(estudiante.estado)}
                          size="sm"
                          variant="flat"
                        >
                          {estudiante.estado}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-xs">
                          {estudiante.notas?.filter((n: Nota) => n.completada)
                            .length || 0}
                          /{calificacionesGrado?.actividades?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip content="Ver detalle">
                            <Button
                              isIconOnly
                              color="primary"
                              size="sm"
                              variant="light"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Generar reporte">
                            <Button
                              isIconOnly
                              color="secondary"
                              size="sm"
                              variant="light"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay calificacionesGrado disponibles
              </h3>
              <p className="text-gray-600">
                No se encontraron calificacionesGrado para este período
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Botones de Acción */}
      <Card className="shadow-sm">
        <CardBody className="py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <div className="flex gap-3">
              <Button
                className="w-full sm:w-auto"
                color="primary"
                startContent={<Download className="w-4 h-4" />}
                variant="flat"
              >
                Exportar Excel
              </Button>
              <Button
                className="w-full sm:w-auto"
                color="secondary"
                startContent={<FileText className="w-4 h-4" />}
                variant="flat"
              >
                Generar Reporte PDF
              </Button>
            </div>
            <Button
              className="w-full sm:w-auto"
              color="primary"
              isLoading={loading}
              onPress={() => fetchData()}
            >
              {loading ? "Actualizando..." : "Actualizar Datos"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
