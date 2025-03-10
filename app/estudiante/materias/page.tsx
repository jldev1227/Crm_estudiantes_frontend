"use client";

import React, { useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useEstudiante } from "@/app/context/EstudianteContext";
import { useMediaQuery } from "react-responsive";

export default function Page() {
  const route = useRouter();
  const { areas } = useEstudiante();
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  useEffect(() => {
    // obtenerCursosMaestro()
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl uppercase font-bold text-blue-600">
          Materias asignadas
        </h1>
        <p>
          Gestiona tus materias asignadas y realiza el consulta las actividades
          realizadas para tu curso
        </p>
      </div>

      {isDesktop ? (
        // Vista de tarjetas para escritorio
        // Vista de tabla para móvil
        <div>
          <Table aria-label="Tabla de materias asignadas">
            <TableHeader>
              <TableColumn>MATERIA</TableColumn>
              <TableColumn>PROFESOR</TableColumn>
              <TableColumn>CONSULTAR</TableColumn>
            </TableHeader>
            <TableBody>
              {areas?.map((area, index) => (
                <TableRow key={index}>
                  <TableCell>{area.nombre}</TableCell>
                  <TableCell>{area.nombre}</TableCell>
                  <TableCell>
                    <Button
                      color="primary"
                      isIconOnly
                      onPress={() =>
                        route.push(`/estudiante/actividades?area=${area.id}`)
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas?.map((area, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden border border-gray-200"
              onClick={() => route.push(`/estudiante/actividades?area=${area.id}`)}
            >
              <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-white text-5xl font-bold">
                  {area.nombre.charAt(0)}
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {area.nombre}
                </h2>
                <p className="text-gray-600 mt-2">Profesor: {area.nombre}</p>
                <div className="mt-4 flex justify-end">
                  <Button
                    onPress={() =>
                      route.push(`/estudiante/actividades?area=${area.id}`)
                    }
                    color="primary"
                    className="flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                    Ver Actividades
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
