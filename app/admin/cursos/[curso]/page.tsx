"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAdmin } from "@/app/context/AdminContext";
import EstudiantesResponsive from "@/components/estudiantesResponsive";
import { Button } from "@heroui/button";
import Link from "next/link";

export default function CursoPage() {
  const params = useParams();
  const id = params.curso as string;

  // Use the AdminContext
  const { obtenerCurso, curso, actualizarPension } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Efecto para cargar datos del curso usando el contexto
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (id) {
          await obtenerCurso(id);
        }
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos del curso");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);


  if (loading) return <div>Cargando...</div>;

  // Manejar errores específicamente
  if (error) return <div>Error al cargar el curso: {error}</div>;

  // Verificar que los datos existan
  if (!curso) return <div>No se encontró información del curso</div>;

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl uppercase font-bold text-blue-600">
            Curso - {curso.nombre}
          </h1>
          <Button radius="sm" as={Link} color="primary" href={"/admin/cursos"}>
            Volver
          </Button>
        </div>
        <div className="space-y-4 md:flex justify-between items-center">
          <h2 className="text-gray-600 text-xl">Estudiantes</h2>
          <Button
            className="max-sm:w-full"
            radius="sm"
            href=""
            as={Link}
            color="primary"
            variant="solid"
          >
            Calificaciones
          </Button>
        </div>
        {curso.estudiantes && curso.estudiantes.length > 0 ? (
          <EstudiantesResponsive handlePension={actualizarPension} isAdmin={true} estudiantes={curso.estudiantes} />
        ) : (
          <p className="text-yellow-500">
            No hay estudiantes en este curso
          </p>
        )}
      </div>
    </div>
  );
}