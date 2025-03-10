'use client';

import React from 'react';
import { useMediaQuery } from 'react-responsive';
import TablaEstudiantes from '@/components/TablaEstudiantes';
import { Card } from '@heroui/card'; // Importamos Card de HeroUI
import { Estudiante } from '@/types';

// Componente para mostrar estudiantes según el tamaño de pantalla
export default function EstudiantesResponsive({ estudiantes } : {estudiantes : Estudiante[]}) {
  const isDesktop = useMediaQuery({ minWidth: 992 });

  // Si no hay estudiantes, muestra un mensaje
  if (estudiantes.length === 0) {
    return <p>No hay estudiantes asociados al curso</p>;
  }

  // Si es desktop, muestra la tabla
  if (isDesktop) {
    return <TablaEstudiantes estudiantes={estudiantes} />;
  }

  // Si es móvil o tablet, muestra cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {estudiantes.map((estudiante : Estudiante) => (
        <Card key={estudiante.id} className="shadow-sm transition-shadow ease-in-out duration-500 bg-gray-50">
          <div className="p-4">
            <h3 className="font-bold text-lg">{estudiante.nombre_completo}</h3>
            {estudiante.nombre_completo && (
              <p className="text-sm text-gray-600">Tipo documento: {estudiante.tipo_documento}</p>
            )}
            {estudiante.tipo_documento && (
              <p className="text-sm">Documento: {estudiante.numero_identificacion}</p>
            )}
            {estudiante.numero_identificacion && (
              <p className="text-sm">Teléfono: {estudiante.celular_padres}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}