"use client";

import React, { useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { useMaestro } from "@/app/context/MaestroContext";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { Curso } from "@/types";

export default function Page() {

  const route = useRouter();
  const { cursos, obtenerCursosMaestro } = useMaestro();
  // 🔹 Definir los datos como un array de objetos

  useEffect(() => {
    obtenerCursosMaestro()
  }, [])

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h1 className='text-2xl uppercase font-bold text-blue-600'>Cursos asignados</h1>
        <p>Gestiona tus cursos asignados y realiza el registro de actividades realizadas en cada curso</p>
      </div>

      <div>
        <Table aria-label="Example static collection table">
          <TableHeader>
            <TableColumn>CURSO</TableColumn>
            <TableColumn>MATERIA ASIGNADA</TableColumn>
            <TableColumn>CONSULTAR</TableColumn>
          </TableHeader>
          <TableBody>
            {cursos?.map((curso : Curso, index : number) => (
              <TableRow key={index}>
                <TableCell>{curso.grado.nombre}</TableCell>
                <TableCell>{curso.area.nombre}</TableCell>
                <TableCell>
                  <Button onPress={()=>{
                    route.push(`/maestro/cursos/${curso.grado.id}/areas/${curso.area.id}`)
                  }} color='primary' isIconOnly>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
