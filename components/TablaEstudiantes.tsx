"use client";

import React from "react";
import { Pagination } from "@heroui/pagination";
import { Button } from "@heroui/button";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  ChevronUp,
  ChevronDown,
  User,
  Calendar,
  Phone,
  CreditCard,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Estudiante } from "@/types";

// Definimos interfaces para ordenamiento
type SortField =
  | "nombre_completo"
  | "numero_identificacion"
  | "tipo_documento"
  | "fecha_nacimiento"
  | "pension_activa"
  | "ver_calificaciones";
type SortDirection = "asc" | "desc";

interface TablaEstudiantesProps {
  estudiantes: Estudiante[];
  isAdmin?: boolean;
  isDirector?: boolean;
  isVisible?: boolean;
  onPensionChange?: (estudianteId: number) => void;
  onCalificacionesChange?: (estudianteId: number) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSortChange?: (campo: SortField) => void;
}

export default function TablaEstudiantes({
  estudiantes,
  isAdmin,
  isDirector,
  isVisible,
  onPensionChange,
  onCalificacionesChange,
  sortField = "nombre_completo",
  sortDirection = "asc",
  onSortChange,
}: TablaEstudiantesProps) {
  const router = useRouter();
  const params = useParams();
  const [page, setPage] = React.useState(1);
  const [estudiantesState, setEstudiantesState] =
    React.useState<Estudiante[]>(estudiantes);
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(
    new Set(),
  );
  const [dropdownOpen, setDropdownOpen] = React.useState<number | null>(null);
  const rowsPerPage = 10;

  // Actualizar estudiantesState cuando cambie el prop estudiantes
  React.useEffect(() => {
    setEstudiantesState(estudiantes);
  }, [estudiantes]);

  // Función para manejar el cambio de estado de pensión
  const handlePension = (estudianteId: number) => {
    if (onPensionChange) {
      onPensionChange(estudianteId);
    }
  };

  // Función para manejar el cambio de estado de calificaciones
  const handleCalificaciones = (estudianteId: number) => {
    if (onCalificacionesChange) {
      onCalificacionesChange(estudianteId);
    }
  };

  // Función para calcular la edad a partir de fecha_nacimiento
  const calcularEdad = (fechaNacimiento: string): number => {
    try {
      const fechaNac = new Date(fechaNacimiento);
      const hoy = new Date();

      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const mesActual = hoy.getMonth();
      const diaActual = hoy.getDate();
      const mesNacimiento = fechaNac.getMonth();
      const diaNacimiento = fechaNac.getDate();

      if (
        mesNacimiento > mesActual ||
        (mesNacimiento === mesActual && diaNacimiento > diaActual)
      ) {
        edad--;
      }

      return edad > 0 ? edad : 0;
    } catch (error) {
      console.error("Error al calcular edad:", error);

      return 0;
    }
  };

  // Generar iniciales para avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Generar color de avatar basado en el nombre
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-red-500",
    ];
    const index = name.charCodeAt(0) % colors.length;

    return colors[index];
  };

  // Manejar selección de filas
  const handleSelectRow = (id: number) => {
    const newSelected = new Set(selectedRows);

    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === items.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(items.map((item) => item.id)));
    }
  };

  // Definimos las columnas dinámicamente basadas en props
  const columns = React.useMemo(() => {
    const baseColumns = [
      {
        key: "estudiante",
        label: "ESTUDIANTE",
        sortable: true,
        width: "min-w-0 flex-1",
        hideOnMobile: false,
      },
      {
        key: "documento",
        label: "DOCUMENTO",
        sortable: true,
        width: "w-32 xl:w-40",
        hideOnMobile: true,
      },
      {
        key: "contacto",
        label: "CONTACTO",
        sortable: false,
        width: "w-40 xl:w-48",
        hideOnMobile: false,
      },
    ];

    // Añadir columnas condicionales
    if (isAdmin) {
      baseColumns.push({
        key: "pension",
        label: "PENSIÓN",
        sortable: true,
        width: "w-28 xl:w-32",
        hideOnMobile: true,
      });

      baseColumns.push({
        key: "calificaciones_admin",
        label: "VER NOTAS",
        sortable: true,
        width: "w-28 xl:w-32",
        hideOnMobile: true,
      });
    }

    if (isDirector && isVisible) {
      baseColumns.push({
        key: "calificaciones_director",
        label: "CALIFICACIONES",
        sortable: false,
        width: "w-32",
        hideOnMobile: true,
      });
    }

    baseColumns.push({
      key: "actions",
      label: "",
      sortable: false,
      width: "w-10",
      hideOnMobile: false,
    });

    return baseColumns;
  }, [isAdmin, isDirector, isVisible]);

  const pages = Math.ceil(estudiantesState.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return estudiantesState.slice(start, end);
  }, [page, estudiantesState]);

  // Función para manejar el ordenamiento de columnas
  const handleSort = (key: string) => {
    if (!onSortChange) return;
    const sortableKeys = [
      "estudiante",
      "documento",
      "pension",
      "calificaciones_admin",
    ];

    if (!sortableKeys.includes(key)) return;

    // Mapear keys a campos reales
    const keyMap: { [key: string]: SortField } = {
      estudiante: "nombre_completo",
      documento: "numero_identificacion",
      pension: "pension_activa",
      calificaciones_admin: "ver_calificaciones",
    };

    onSortChange(keyMap[key] || (key as SortField));
  };

  // Función para renderizar flechas de ordenamiento
  const renderSortArrow = (key: string) => {
    const keyMap: { [key: string]: string } = {
      estudiante: "nombre_completo",
      documento: "numero_identificacion",
      pension: "pension_activa",
      calificaciones_admin: "ver_calificaciones",
    };

    const realSortField = keyMap[key] || key;
    const sortableKeys = [
      "estudiante",
      "documento",
      "pension",
      "calificaciones_admin",
    ];

    if (
      realSortField !== (sortField as string) ||
      !sortableKeys.includes(key)
    ) {
      return <ChevronUp className="w-3 h-3 text-gray-300" />;
    }

    return sortDirection === "asc" ? (
      <ChevronUp className="w-3 h-3 text-blue-500" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-500" />
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Header con acciones masivas */}
      {selectedRows.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-800">
                {selectedRows.size} estudiante(s) seleccionado(s)
              </p>
              <p className="text-sm text-blue-600">
                Puedes realizar acciones masivas
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Exportar
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Eliminar
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              onClick={() => setSelectedRows(new Set())}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla responsive */}
      <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div>
          <table className="min-w-full">
            {/* Cabecera de la tabla */}
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`${column.width} px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                      column.hideOnMobile ? "hidden lg:table-cell" : ""
                    } ${
                      column.sortable && onSortChange
                        ? "cursor-pointer hover:bg-gray-100 transition-colors"
                        : ""
                    }`}
                    scope="col"
                    onClick={() =>
                      column.sortable ? handleSort(column.key) : null
                    }
                  >
                    {column.key === "select" ? (
                      <input
                        checked={
                          selectedRows.size === items.length && items.length > 0
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        type="checkbox"
                        onChange={handleSelectAll}
                      />
                    ) : (
                      <div className="flex items-center space-x-1 group">
                        <span className="truncate">{column.label}</span>
                        {column.sortable && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {renderSortArrow(column.key)}
                          </div>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Cuerpo de la tabla */}
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`hover:bg-blue-50/50 transition-all duration-200 ${
                    selectedRows.has(item.id)
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  {/* Información del estudiante */}
                  <td className="px-3 lg:px-4 xl:px-6 py-3 min-w-0">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                        {item.nombre_completo}
                      </div>
                      <div className="text-xs lg:text-sm text-gray-500">
                        {/* En móvil mostramos el documento aquí */}
                        <span className="lg:hidden flex items-center space-x-1">
                          <CreditCard className="w-3 h-3" />
                          <span>
                            {item.tipo_documento}: {item.numero_identificacion}
                          </span>
                        </span>
                        {/* En desktop mostramos edad */}
                        <span className="hidden lg:flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {calcularEdad(item.fecha_nacimiento)} años
                          </span>
                        </span>
                      </div>

                      {/* Estados en móvil */}
                      <div className="lg:hidden flex flex-wrap gap-1 mt-2">
                        {isAdmin && (
                          <>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.pension_activa
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.pension_activa ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              Pensión
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.ver_calificaciones
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.ver_calificaciones ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              Notas
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Documento (oculto en móvil) */}
                  <td className="hidden lg:table-cell px-4 xl:px-6 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">
                          {item.tipo_documento}
                        </span>
                      </div>
                      <div className="bg-gray-100 text-gray-800 text-xs font-mono px-2 py-1 rounded-lg inline-block">
                        {item.numero_identificacion}
                      </div>
                    </div>
                  </td>

                  {/* Contacto */}
                  <td className="px-3 lg:px-4 xl:px-6 py-3 min-w-0">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs lg:text-sm">
                        <Phone className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">
                          {item.celular_padres}
                        </span>
                      </div>
                      <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{item.fecha_nacimiento}</span>
                      </div>
                    </div>
                  </td>

                  {/* Pensión (oculto en móvil) */}
                  {isAdmin && (
                    <td className="hidden lg:table-cell px-4 xl:px-6 py-3">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.pension_activa
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {item.pension_activa ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {item.pension_activa ? "Activa" : "Inactiva"}
                        </span>
                        <button
                          className="block w-full px-3 py-1 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          onClick={() => handlePension(item.id)}
                        >
                          Cambiar
                        </button>
                      </div>
                    </td>
                  )}

                  {/* Ver Calificaciones Admin (oculto en móvil) */}
                  {isAdmin && (
                    <td className="hidden lg:table-cell px-4 xl:px-6 py-3">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.ver_calificaciones
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {item.ver_calificaciones ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {item.ver_calificaciones ? "Activa" : "Inactiva"}
                        </span>
                        <button
                          className="block w-full px-3 py-1 text-xs font-medium rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
                          onClick={() => handleCalificaciones(item.id)}
                        >
                          Cambiar
                        </button>
                      </div>
                    </td>
                  )}

                  {/* Calificaciones Director (oculto en móvil) */}
                  {isDirector && isVisible && (
                    <td className="hidden lg:table-cell px-4 xl:px-6 py-3">
                      <Button
                        className="hover:scale-105 transition-transform"
                        color="warning"
                        size="sm"
                        startContent={<FileText className="w-4 h-4" />}
                        variant="flat"
                        onPress={() =>
                          router.push(
                            `${params.curso}/calificaciones/${item.id}`,
                          )
                        }
                      >
                        Ver
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer de la tabla */}
        {items.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              No hay estudiantes para mostrar
            </p>
            <p className="text-gray-400 text-sm">
              Los estudiantes aparecerán aquí una vez que sean agregados
            </p>
          </div>
        )}
      </div>

      {/* Información de paginación y controles */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="text-sm text-gray-600">
          Mostrando {items.length === 0 ? 0 : (page - 1) * rowsPerPage + 1} a{" "}
          {Math.min(page * rowsPerPage, estudiantesState.length)} de{" "}
          {estudiantesState.length} estudiantes
        </div>

        {pages > 1 && (
          <Pagination
            classNames={{
              wrapper:
                "gap-0 overflow-visible h-8 rounded-xl border border-divider",
              item: "w-8 h-8 text-small rounded-none bg-transparent",
              cursor:
                "bg-gradient-to-b shadow-lg from-blue-500 to-blue-600 text-white font-bold",
            }}
            initialPage={1}
            page={page}
            total={pages}
            onChange={(p) => setPage(p)}
          />
        )}
      </div>
    </div>
  );
}
