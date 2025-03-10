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
import ResponsiveHandler from "@/components/ResponsiveHandler"; // Importa el nuevo componente

interface Estudiante {
  id: string;
  tipo_documento: string;
  numero_identificacion: string;
  fecha_nacimiento: string;
  nombre_completo: string;
  celular_padres: string;
}

interface TablaEstudiantesProps {
  estudiantes: Estudiante[];
}

const columns = [
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

export default function TablaEstudiantes({
  estudiantes,
}: TablaEstudiantesProps) {
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;

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

            {/* Resto de las columnas */}
            <TableCell>{item.tipo_documento}</TableCell>
            <TableCell>{item.numero_identificacion}</TableCell>
            <TableCell>{item.fecha_nacimiento}</TableCell>
            <TableCell>{item.nombre_completo}</TableCell>
            <TableCell>{item.celular_padres}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
