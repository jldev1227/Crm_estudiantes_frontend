"use client"; // Marca este componente como un Client Component

import { Pagination } from "@heroui/pagination";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import React from "react";

interface Estudiante {
  id: string;
  tipo_documento: string;
  numero_identificacion: string;
  fecha_nacimiento: string;
  nombre_completo: string;
  celular_padres: string;
  pension_activa?: boolean; // Hago opcional esta propiedad ya que podría no estar en todos los registros
}

interface TablaEstudiantesProps {
  estudiantes: Estudiante[];
  isAdmin: boolean;
}

export default function TablaEstudiantes({
  estudiantes,
  isAdmin
}: TablaEstudiantesProps) {
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;

  // Definimos las columnas dinámicamente basadas en isAdmin
  const columns = React.useMemo(() => {
    const baseColumns = [
      {
        key: "index",
        label: "#",
      },
      {
        key: "tipo_documento",
        label: "TIPO DOCUMENTO",
      },
      {
        key: "numero_identificacion",
        label: "NÚMERO IDENTIFICACIÓN",
      },
      {
        key: "fecha_nacimiento",
        label: "FECHA NACIMIENTO",
      },
      {
        key: "nombre_completo",
        label: "NOMBRE COMPLETO",
      },
      {
        key: "celular_padres",
        label: "CELULAR PADRES",
      },
    ];
    
    // Añadimos la columna de Pensión solo si el usuario es admin
    if (isAdmin) {
      baseColumns.push({
        key: "pension_activa",
        label: "PENSIÓN",
      });
    }
    
    return baseColumns;
  }, [isAdmin]);

  const pages = Math.ceil(estudiantes.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return estudiantes.slice(start, end);
  }, [page, estudiantes]);

  return (
    <Table
      aria-label="Tabla de estudiantes"
      bottomContent={
        pages > 0 ? (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        ) : null
      }
    >
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item.id}>
            {/* Columna del índice */}
            <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>

            {/* Resto de las columnas estándar */}
            <TableCell>{item.tipo_documento}</TableCell>
            <TableCell>{item.numero_identificacion}</TableCell>
            <TableCell>{item.fecha_nacimiento}</TableCell>
            <TableCell>{item.nombre_completo}</TableCell>
            <TableCell>{item.celular_padres}</TableCell>
            
            {/* Columna de Pensión, solo visible si isAdmin es true */}
            {isAdmin && (
              <TableCell>
                {item.pension_activa ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activa
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactiva
                  </span>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}