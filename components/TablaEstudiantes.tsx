"use client";

import { Pagination } from "@heroui/pagination";
import React from "react";

// Definimos interfaces para ordenamiento
type SortField = 'nombre_completo' | 'numero_identificacion' | 'tipo_documento' | 'fecha_nacimiento' | 'pension_activa';
type SortDirection = 'asc' | 'desc';

// Definimos interfaces
interface Estudiante {
  id: string;
  tipo_documento: string;
  numero_identificacion: string;
  fecha_nacimiento: string;
  nombre_completo: string;
  celular_padres: string;
  pension_activa?: boolean;
}

interface TablaEstudiantesProps {
  estudiantes: Estudiante[];
  isAdmin: boolean;
  onPensionChange?: (estudianteId: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSortChange?: (campo: SortField) => void;
}

export default function TablaEstudiantes({
  estudiantes,
  isAdmin,
  onPensionChange,
  sortField = 'nombre_completo',
  sortDirection = 'asc',
  onSortChange
}: TablaEstudiantesProps) {
  const [page, setPage] = React.useState(1);
  const [estudiantesState, setEstudiantesState] = React.useState<Estudiante[]>(estudiantes);
  const rowsPerPage = 10;
  
  // Actualizar estudiantesState cuando cambie el prop estudiantes
  React.useEffect(() => {
    setEstudiantesState(estudiantes);
  }, [estudiantes]);
  
  // Función para manejar el cambio de estado de pensión
  const handlePension = (estudianteId: string) => {
    console.log(estudianteId)
    // Llamar al callback si existe
    if (onPensionChange) {
      onPensionChange(estudianteId);
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
      
      // Ajustar edad si aún no ha cumplido años en el año actual
      if (mesNacimiento > mesActual || (mesNacimiento === mesActual && diaNacimiento > diaActual)) {
        edad--;
      }
      
      return edad > 0 ? edad : 0;
    } catch (error) {
      console.error("Error al calcular edad:", error);
      return 0;
    }
  };

  // Definimos las columnas dinámicamente basadas en isAdmin
  const columns = React.useMemo(() => {
    const baseColumns = [
      {
        key: "index",
        label: "#",
        sortable: false
      },
      {
        key: "tipo_documento",
        label: "TIPO DOCUMENTO",
        sortable: true
      },
      {
        key: "numero_identificacion",
        label: "NÚMERO IDENTIFICACIÓN",
        sortable: true
      },
      {
        key: "fecha_nacimiento",
        label: "FECHA NACIMIENTO / EDAD",
        sortable: true
      },
      {
        key: "nombre_completo",
        label: "NOMBRE COMPLETO",
        sortable: true
      },
      {
        key: "celular_padres",
        label: "CELULAR PADRES",
        sortable: false
      },
    ];

    // Añadimos la columna de Pensión solo si el usuario es admin
    if (isAdmin) {
      baseColumns.push({
        key: "pension_activa",
        label: "PENSIÓN",
        sortable: true
      });
    }

    return baseColumns;
  }, [isAdmin]);

  const pages = Math.ceil(estudiantesState.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return estudiantesState.slice(start, end);
  }, [page, estudiantesState]);

  // Función para manejar el ordenamiento de columnas
  const handleSort = (key: string) => {
    if (!onSortChange || key === 'index' || key === 'celular_padres') return;
    onSortChange(key as SortField);
  };

  // Función para renderizar flechas de ordenamiento
  const renderSortArrow = (key: string) => {
    if (key !== sortField as string || key === 'index' || key === 'celular_padres') return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
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
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable && onSortChange ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={() => column.sortable ? handleSort(column.key) : null}
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
                  {item.fecha_nacimiento} ({calcularEdad(item.fecha_nacimiento)} años)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.nombre_completo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.celular_padres}
                </td>
                
                {/* Columna de Pensión, solo si isAdmin es true */}
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      {item.pension_activa ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Inactiva
                        </span>
                      )}
                      <button
                        onClick={() => handlePension(item.id)}
                        className="ml-2 px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        aria-label={`Cambiar estado de pensión para ${item.nombre_completo}`}
                      >
                        Cambiar
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pages > 0 && (
        <div className="flex justify-center mt-4">
          <Pagination
            total={pages}
            initialPage={1}
            page={page}
            onChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}