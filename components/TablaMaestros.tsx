"use client";

import { Pagination } from "@heroui/pagination";
import React from "react";

import { Maestro } from "@/types";

// Definimos interfaces para ordenamiento
type SortField = "nombre_completo" | "numero_identificacion" | "tipo_documento";
type SortDirection = "asc" | "desc";

interface TablaEstudiantesProps {
  maestros: Maestro[];
  onPensionChange?: (estudianteId: number) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSortChange?: (campo: SortField) => void;
}

export default function TablaMaestros({
  maestros,
  sortField = "nombre_completo",
  sortDirection = "asc",
  onSortChange,
}: TablaEstudiantesProps) {
  const [page, setPage] = React.useState(1);
  const [estudiantesState, setEstudiantesState] =
    React.useState<Maestro[]>(maestros);
  const rowsPerPage = 10;

  // Actualizar estudiantesState cuando cambie el prop maestros
  React.useEffect(() => {
    setEstudiantesState(maestros);
  }, [maestros]);

  const columns = React.useMemo(() => {
    const baseColumns = [
      {
        key: "index",
        label: "#",
        sortable: false,
      },
      {
        key: "tipo_documento",
        label: "TIPO DOCUMENTO",
        sortable: true,
      },
      {
        key: "numero_identificacion",
        label: "NÚMERO IDENTIFICACIÓN",
        sortable: true,
      },
      {
        key: "nombre_completo",
        label: "NOMBRE COMPLETO",
        sortable: true,
      },
      {
        key: "email",
        label: "EMAIL",
        sortable: false,
      },
      {
        key: "celular",
        label: "CELULAR",
        sortable: false,
      },
    ];

    return baseColumns;
  }, []);

  const pages = Math.ceil(estudiantesState.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return estudiantesState.slice(start, end);
  }, [page, estudiantesState]);

  // Función para manejar el ordenamiento de columnas
  const handleSort = (key: string) => {
    if (!onSortChange || key === "index" || key === "celular_padres") return;
    onSortChange(key as SortField);
  };

  // Función para renderizar flechas de ordenamiento
  const renderSortArrow = (key: string) => {
    if (
      key !== (sortField as string) ||
      key === "index" ||
      key === "celular_padres"
    )
      return null;

    return (
      <span className="ml-1">
        {sortDirection === "asc" ? (
          <svg
            className="w-4 h-4 inline"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m4.5 15.75 7.5-7.5 7.5 7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 inline"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Tabla con estilo personalizado similar a HeroUI */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Cabecera de la tabla */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable && onSortChange ? "cursor-pointer hover:bg-gray-100" : ""}`}
                  scope="col"
                  onClick={() =>
                    column.sortable ? handleSort(column.key) : null
                  }
                >
                  <div className="flex items-center">
                    {column.label}
                    {renderSortArrow(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Cuerpo de la tabla */}
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {/* Columna del índice */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(page - 1) * rowsPerPage + index + 1}
                </td>

                {/* Columnas estándar */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.tipo_documento}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.numero_identificacion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.nombre_completo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.celular}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pages > 0 && (
        <div className="flex justify-center mt-4">
          <Pagination
            initialPage={1}
            page={page}
            total={pages}
            onChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
