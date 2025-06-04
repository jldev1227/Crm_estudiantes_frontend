"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

import { Calificacion, Estudiante } from "@/types";
import { GUARDAR_CALIFICACIONES } from "@/app/graphql/mutation/guardarCalificaciones";
import { useMaestro } from "@/app/context/MaestroContext";

// Iconos como componentes
const WarningIcon = () => (
  <svg
    className="size-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4.5v15m7.5-7.5h-15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CalculatorIcon = () => (
  <svg
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008V18H8.25v-.008ZM12 13.5h.008v.008H12V13.5Zm0 2.25h.008v.008H12v-.008Zm0 2.25h.008V18H12v-.008ZM15.75 13.5h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008ZM8.25 9.75h8.25V12h-8.25V9.75Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type Actividad = {
  id: string;
  nombre: string;
  porcentaje: number;
  isFinal: boolean;
};

// Tipos para las calificaciones del contexto
type Nota = {
  id: string;
  valor: number;
  nombre: string;
  porcentaje: number;
  actividad_id: string;
};

const SistemaCalificaciones = () => {
  const params = useParams();
  const router = useRouter();
  const grado_id = params?.curso as string;
  const area_id = params?.area as string;

  // Constants
  const REGULAR_ACTIVITIES_PERCENTAGE = 70;
  const FINAL_EVALUATION_PERCENTAGE = 30;

  // Use the MaestroContext
  const {
    obtenerCurso,
    obtenerCalificaciones,
    establecerPeriodo,
    curso,
    area,
    calificaciones: calificacionesContext,
    periodoSeleccionado,
  } = useMaestro();

  // Estados locales
  const [actividades, setActividades] = useState<Actividad[]>([
    { id: "final", nombre: "Evaluación Final", porcentaje: 30, isFinal: true },
  ]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [calificaciones, setCalificaciones] = useState<{
    [estudianteId: string]: { [actividadId: string]: string };
  }>({});
  const [editando, setEditando] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState<{
    nombre: string;
    porcentaje: string;
  }>({ nombre: "", porcentaje: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // GraphQL mutation
  const [guardarCalificaciones, { loading: guardandoCalificaciones }] =
    useMutation(GUARDAR_CALIFICACIONES, {
      onCompleted: (data) => {
        if (data.guardarCalificaciones.success) {
          toast.success(
            data.guardarCalificaciones.mensaje ||
              "Calificaciones guardadas con éxito",
          );
          // Actualizar los datos desde el contexto
          obtenerCalificaciones(grado_id, area_id, periodoSeleccionado);
        } else {
          toast.error(
            data.guardarCalificaciones.mensaje ||
              "Error al guardar calificaciones",
          );
        }
        setLoading(false);
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
        setError(error.message);
        setLoading(false);
      },
    });

  // Efecto para cargar datos del curso
  const fetchData = useCallback(async () => {
    if (!grado_id || !area_id) return;

    try {
      // Cargar datos del curso
      await obtenerCurso(grado_id, area_id);

      // Cargar calificaciones para el periodo seleccionado
      await obtenerCalificaciones(grado_id, area_id, periodoSeleccionado);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    }
  }, [grado_id, area_id, periodoSeleccionado]);

  // Cargar datos al montar el componente
  useEffect(() => {
    const mounted = { current: true };

    if (mounted.current) {
      fetchData();
    }

    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  // Efecto para cargar estudiantes cuando se obtienen los datos del curso
  useEffect(() => {
    if (curso?.estudiantes) {
      setEstudiantes(curso.estudiantes);
    }
  }, [curso]);

  // Efecto para cargar calificaciones existentes desde el contexto - CORREGIDO
  useEffect(() => {
    if (calificacionesContext && Array.isArray(calificacionesContext)) {
      // Filtrar solo las calificaciones del período actual
      const calificacionesPeriodoActual = calificacionesContext.filter(
        (calificacion: any) => calificacion.periodo === periodoSeleccionado,
      );

      if (calificacionesPeriodoActual.length > 0) {
        // Extraer todas las actividades únicas de las calificaciones existentes
        const actividadesExistentes = new Set<string>();
        const actividadesInfo = new Map<
          string,
          { nombre: string; porcentaje: number }
        >();

        calificacionesPeriodoActual.forEach((calificacion: any) => {
          calificacion.notas.forEach((nota: any) => {
            actividadesExistentes.add(nota.actividad_id);
            actividadesInfo.set(nota.actividad_id, {
              nombre: nota.nombre,
              porcentaje: nota.porcentaje,
            });
          });
        });

        // Crear array de actividades basado en las calificaciones existentes
        const nuevasActividades: Actividad[] = [];

        actividadesExistentes.forEach((actividadId) => {
          const info = actividadesInfo.get(actividadId);

          if (info) {
            nuevasActividades.push({
              id: actividadId,
              nombre: info.nombre,
              porcentaje: info.porcentaje,
              isFinal:
                actividadId === "final" ||
                info.nombre.toLowerCase().includes("final"),
            });
          }
        });

        // Asegurar que la evaluación final esté presente si no existe
        const tieneEvaluacionFinal = nuevasActividades.some(
          (act) => act.isFinal,
        );

        if (!tieneEvaluacionFinal) {
          nuevasActividades.push({
            id: "final",
            nombre: "Evaluación Final",
            porcentaje: 30,
            isFinal: true,
          });
        }

        // Actualizar las actividades solo si son diferentes
        setActividades((prev) => {
          const idsActuales = prev.map((a) => a.id).sort();
          const idsNuevos = nuevasActividades.map((a) => a.id).sort();

          if (JSON.stringify(idsActuales) !== JSON.stringify(idsNuevos)) {
            return nuevasActividades;
          }

          return prev;
        });

        // Mapear las calificaciones a la estructura local - CONVERTIR A STRING
        const nuevasCalificaciones: {
          [estudianteId: string]: { [actividadId: string]: string };
        } = {};

        // Inicializar para todos los estudiantes
        estudiantes.forEach((estudiante) => {
          nuevasCalificaciones[estudiante.id] = {};
          nuevasActividades.forEach((actividad) => {
            nuevasCalificaciones[estudiante.id][actividad.id] = "";
          });
        });

        // Llenar con los valores existentes - CONVERTIR NÚMEROS A STRING
        calificacionesPeriodoActual.forEach((calificacion: any) => {
          const estudianteId = calificacion.estudiante_id.toString();

          if (nuevasCalificaciones[estudianteId]) {
            calificacion.notas.forEach((nota: any) => {
              if (
                nota.actividad_id &&
                nota.valor !== undefined &&
                nota.valor !== null
              ) {
                // CONVERTIR EL NÚMERO A STRING
                nuevasCalificaciones[estudianteId][nota.actividad_id] =
                  nota.valor.toString();
              }
            });
          }
        });

        setCalificaciones(nuevasCalificaciones);
      } else {
        // Si no hay calificaciones para este período, resetear a actividades por defecto
        console.log(
          "No hay calificaciones para el período actual, usando actividades por defecto",
        );
        setActividades([
          {
            id: "final",
            nombre: "Evaluación Final",
            porcentaje: 30,
            isFinal: true,
          },
        ]);

        // Inicializar calificaciones vacías para todos los estudiantes
        const calificacionesVacias: {
          [estudianteId: string]: { [actividadId: string]: string };
        } = {};

        estudiantes.forEach((estudiante) => {
          calificacionesVacias[estudiante.id] = { final: "" };
        });
        setCalificaciones(calificacionesVacias);
      }
    }
  }, [calificacionesContext, periodoSeleccionado, estudiantes]);

  // Efecto para sincronizar calificaciones cuando cambian estudiantes o actividades
  useEffect(() => {
    setCalificaciones((prev) => {
      const nuevasCalificaciones: {
        [estudianteId: string]: { [actividadId: string]: string };
      } = {};

      estudiantes.forEach((estudiante) => {
        nuevasCalificaciones[estudiante.id] = {};
        actividades.forEach((actividad) => {
          // Mantener valor anterior si existe, si no, dejar vacío
          nuevasCalificaciones[estudiante.id][actividad.id] =
            prev?.[estudiante.id]?.[actividad.id] ?? "";
        });
      });

      return nuevasCalificaciones;
    });
  }, [estudiantes, actividades]);

  // Función distribuirPorcentajes - CORREGIDA
  const distribuirPorcentajes = useCallback(
    (
      actividadesRegulares: Actividad[],
      actividadesFinal: Actividad[],
    ): Actividad[] => {
      if (actividadesRegulares.length === 0) {
        return [...actividadesFinal]; // Devolver solo las actividades finales si no hay regulares
      }

      // El nuevo porcentaje para cada actividad regular (total 70% dividido equitativamente)
      const nuevoPorcentaje =
        REGULAR_ACTIVITIES_PERCENTAGE / actividadesRegulares.length;

      // Actualizar los porcentajes de las actividades regulares
      const nuevasActividadesRegulares: Actividad[] = actividadesRegulares.map(
        (act: Actividad) => ({
          ...act,
          porcentaje: nuevoPorcentaje,
        }),
      );

      return [...nuevasActividadesRegulares, ...actividadesFinal];
    },
    [REGULAR_ACTIVITIES_PERCENTAGE],
  );

  // Función mejorada para manejar el cambio de período
  const handlePeriodoChange = (periodo: string) => {
    const periodoNumerico = parseInt(periodo);

    establecerPeriodo(periodoNumerico);

    // Limpiar calificaciones al cambiar de período
    setCalificaciones({});

    // Resetear actividades a las por defecto
    setActividades([
      {
        id: "final",
        nombre: "Evaluación Final",
        porcentaje: 30,
        isFinal: true,
      },
    ]);

    // Cargar calificaciones del nuevo período
    if (grado_id && area_id) {
      obtenerCalificaciones(grado_id, area_id, periodoNumerico);
    }
  };

  // Manejar cambio de calificación
  const handleCalificacionChange = (
    estudianteId: number,
    actividadId: string,
    valor: string,
  ) => {
    // Validar que la nota esté entre 0 y 5
    const valorNumerico = parseFloat(valor);

    if (isNaN(valorNumerico) && valor !== "") {
      return;
    }

    if (valorNumerico < 0 || valorNumerico > 5) {
      return;
    }

    setCalificaciones((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [actividadId]: valor,
      },
    }));
  };

  // Añadir nueva actividad - CORREGIDO COMPLETAMENTE
  const handleAddActividad = () => {
    if (!nuevaActividad.nombre) {
      toast.error("Ingrese nombre para la nueva actividad");

      return;
    }

    // Separar actividades regulares de la evaluación final
    const actividadesRegulares: Actividad[] = actividades.filter(
      (act) => !act.isFinal,
    );
    const actividadesFinal: Actividad[] = actividades.filter(
      (act) => act.isFinal,
    );

    // Crear la nueva actividad con TODAS las propiedades del tipo Actividad
    const nuevaActividadObj: Actividad = {
      id: `act${actividades.length + 1}`,
      nombre: nuevaActividad.nombre,
      porcentaje: 0, // Se calculará automáticamente en distribuirPorcentajes
      isFinal: false, // Es una actividad regular, no final
    };

    // Añadir la nueva actividad a las actividades regulares
    const nuevasActividadesRegulares: Actividad[] = [
      ...actividadesRegulares,
      nuevaActividadObj,
    ];

    // Redistribuir porcentajes automáticamente
    const nuevasActividades = distribuirPorcentajes(
      nuevasActividadesRegulares,
      actividadesFinal,
    );

    setActividades(nuevasActividades);

    // Actualizar la estructura de calificaciones
    setCalificaciones((prev) => {
      const nuevo = { ...prev };

      Object.keys(nuevo).forEach((estudianteId) => {
        nuevo[estudianteId][nuevaActividadObj.id] = "";
      });

      return nuevo;
    });

    // Reiniciar el formulario - CORREGIR también esto
    setNuevaActividad({ nombre: "", porcentaje: "" }); // Solo limpiar nombre, no porcentaje

    toast.success(
      `Actividad "${nuevaActividad.nombre}" añadida. Porcentajes redistribuidos automáticamente.`,
    );
  };

  // Recalcular porcentajes
  const recalcularPorcentajes = () => {
    // Separar actividades regulares de la evaluación final
    const actividadesRegulares = actividades.filter((act) => !act.isFinal);
    const actividadesFinal = actividades.filter((act) => act.isFinal);

    if (actividadesRegulares.length === 0) {
      toast.error("No hay actividades regulares para redistribuir");

      return;
    }

    // Distribuir porcentajes y actualizar actividades
    const nuevasActividades = distribuirPorcentajes(
      actividadesRegulares,
      actividadesFinal,
    );

    setActividades(nuevasActividades);

    toast.success("Porcentajes redistribuidos equitativamente");
  };

  // Calcular nota final para un estudiante
  const calcularNotaFinal = (estudianteId: number): number => {
    if (!calificaciones[estudianteId]) return 0;

    let notaFinal = 0;
    let porcentajeTotal = 0;

    actividades.forEach((actividad) => {
      const valor = parseFloat(calificaciones[estudianteId][actividad.id]);

      if (!isNaN(valor)) {
        notaFinal += valor * (actividad.porcentaje / 100);
        porcentajeTotal += actividad.porcentaje;
      }
    });

    if (porcentajeTotal === 0) return 0;

    // Ajustar según el porcentaje evaluado
    const notaAjustada = notaFinal * (100 / porcentajeTotal);

    return Math.round(notaAjustada * 100) / 100; // Round to 2 decimal places
  };

  // Eliminar actividad
  const handleEliminarActividad = (actividadId: string) => {
    if (actividades.length <= 1) {
      toast.error("Debe haber al menos una actividad");

      return;
    }

    // No permitir eliminar la evaluación final
    const actividad = actividades.find((act) => act.id === actividadId);

    if (actividad?.isFinal) {
      toast.error("No se puede eliminar la evaluación final");

      return;
    }

    // Separar actividades regulares de la evaluación final
    const actividadesRegulares = actividades.filter((act) => !act.isFinal);
    const actividadesFinal = actividades.filter((act) => act.isFinal);

    // Eliminar la actividad de las actividades regulares
    const nuevasActividadesRegulares = actividadesRegulares.filter(
      (act) => act.id !== actividadId,
    );

    if (nuevasActividadesRegulares.length === 0) {
      toast.error("Debe haber al menos una actividad regular");

      return;
    }

    // Redistribuir porcentajes automáticamente
    const nuevasActividades = distribuirPorcentajes(
      nuevasActividadesRegulares,
      actividadesFinal,
    );

    setActividades(nuevasActividades);

    // Actualizar calificaciones
    setCalificaciones((prev) => {
      const nuevo = { ...prev };

      Object.keys(nuevo).forEach((estudianteId) => {
        const nuevoEstudiante = { ...nuevo[estudianteId] };

        delete nuevoEstudiante[actividadId];
        nuevo[estudianteId] = nuevoEstudiante;
      });

      return nuevo;
    });

    toast.success(
      `Actividad eliminada. Porcentajes redistribuidos automáticamente.`,
    );
  };

  // Guardar calificaciones
  const handleGuardarCalificaciones = async () => {
    setLoading(true);
    setError("");

    try {
      const calificacionesSubmit = estudiantes.map((estudiante) => ({
        estudiante_id: estudiante.id,
        notas: actividades.map((actividad) => ({
          actividad_id: actividad.id,
          nombre: actividad.nombre,
          valor: parseFloat(calificaciones[estudiante.id][actividad.id] || "0"),
          porcentaje: actividad.porcentaje,
        })),
      }));

      await guardarCalificaciones({
        variables: {
          input: {
            grado_id,
            area_id,
            periodo: periodoSeleccionado,
            calificaciones: calificacionesSubmit,
          },
        },
      });
    } catch (error) {
      console.error("Error al guardar calificaciones:", error);
      setError(
        "Ocurrió un error al guardar las calificaciones. Por favor, intenta de nuevo.",
      );
      setLoading(false);
    }
  };

  // Verificar porcentajes totales y mostrar advertencias si es necesario
  const verificarPorcentajes = () => {
    const actividadesRegulares = actividades.filter((act) => !act.isFinal);
    const actividadesFinal = actividades.filter((act) => act.isFinal);

    const totalRegulares = actividadesRegulares.reduce(
      (sum, act) => sum + act.porcentaje,
      0,
    );
    const totalFinal = actividadesFinal.reduce(
      (sum, act) => sum + act.porcentaje,
      0,
    );

    return {
      totalRegulares,
      totalFinal,
      total: totalRegulares + totalFinal,
      esValido:
        Math.abs(totalRegulares - REGULAR_ACTIVITIES_PERCENTAGE) < 0.1 &&
        Math.abs(totalFinal - FINAL_EVALUATION_PERCENTAGE) < 0.1,
    };
  };

  // Efecto para cargar calificaciones existentes desde el contexto y autocompletar
  useEffect(() => {
    if (calificacionesContext && Array.isArray(calificacionesContext)) {
      // Filtrar solo las calificaciones del período actual
      const calificacionesPeriodoActual = calificacionesContext.filter(
        (calificacion: Calificacion) =>
          calificacion.periodo === periodoSeleccionado,
      );

      if (calificacionesPeriodoActual.length > 0) {
        // Extraer todas las actividades únicas de las calificaciones existentes
        const actividadesExistentes = new Set<string>();
        const actividadesInfo = new Map<
          string,
          { nombre: string; porcentaje: number }
        >();

        calificacionesPeriodoActual.forEach((calificacion: Calificacion) => {
          calificacion.notas.forEach((nota: Nota) => {
            actividadesExistentes.add(nota.actividad_id);
            actividadesInfo.set(nota.actividad_id, {
              nombre: nota.nombre,
              porcentaje: nota.porcentaje,
            });
          });
        });

        // Crear array de actividades basado en las calificaciones existentes
        const nuevasActividades: Actividad[] = [];

        actividadesExistentes.forEach((actividadId) => {
          const info = actividadesInfo.get(actividadId);

          if (info) {
            nuevasActividades.push({
              id: actividadId,
              nombre: info.nombre,
              porcentaje: info.porcentaje,
              isFinal:
                actividadId === "final" ||
                info.nombre.toLowerCase().includes("final"),
            });
          }
        });

        // Asegurar que la evaluación final esté presente si no existe
        const tieneEvaluacionFinal = nuevasActividades.some(
          (act) => act.isFinal,
        );

        if (!tieneEvaluacionFinal) {
          nuevasActividades.push({
            id: "final",
            nombre: "Evaluación Final",
            porcentaje: 30,
            isFinal: true,
          });
        }

        // Actualizar las actividades
        setActividades(nuevasActividades);
        const nuevasCalificaciones: {
          [estudianteId: string]: { [actividadId: string]: string };
        } = {};

        calificacionesPeriodoActual.forEach((calificacion: Calificacion) => {
          const estudianteId = calificacion.estudiante_id;

          // Add type guard to ensure estudianteId is not undefined
          if (!estudianteId) {
            console.warn(
              "Estudiante ID is undefined, skipping calificacion:",
              calificacion,
            );

            return; // Skip this iteration
          }

          nuevasCalificaciones[estudianteId] = {};

          // Inicializar todas las actividades con valor vacío
          nuevasActividades.forEach((actividad) => {
            nuevasCalificaciones[estudianteId][actividad.id] = "";
          });

          // Llenar con los valores existentes
          calificacion.notas.forEach((nota: Nota) => {
            if (
              nota.actividad_id &&
              nota.valor !== undefined &&
              nota.valor !== null
            ) {
              nuevasCalificaciones[estudianteId][nota.actividad_id] =
                nota.valor.toString();
            }
          });
        });

        setCalificaciones(nuevasCalificaciones);
      } else {
        // Si no hay calificaciones para este período, resetear a actividades por defecto
        console.log(
          "No hay calificaciones para el período actual, usando actividades por defecto",
        );
        setActividades([
          {
            id: "final",
            nombre: "Evaluación Final",
            porcentaje: 30,
            isFinal: true,
          },
        ]);
        setCalificaciones({});
      }
    }
  }, [calificacionesContext, periodoSeleccionado]);

  // Solo se ejecuta si no hay calificaciones del contexto o si se agregan nuevos estudiantes
  useEffect(() => {
    if (!calificacionesContext || calificacionesContext.length === 0) {
      setCalificaciones((prev) => {
        const nuevasCalificaciones: {
          [estudianteId: string]: { [actividadId: string]: string };
        } = {};

        estudiantes.forEach((estudiante) => {
          nuevasCalificaciones[estudiante.id] = {};
          actividades.forEach((actividad) => {
            // Mantener valor anterior si existe, si no, dejar vacío
            nuevasCalificaciones[estudiante.id][actividad.id] =
              prev?.[estudiante.id]?.[actividad.id] ?? "";
          });
        });

        return nuevasCalificaciones;
      });
    } else {
      // Si hay calificaciones del contexto, solo agregar estudiantes nuevos que no estén en las calificaciones
      setCalificaciones((prev) => {
        const nuevasCalificaciones = { ...prev };

        estudiantes.forEach((estudiante) => {
          // Si el estudiante no existe en las calificaciones actuales, agregarlo
          if (!nuevasCalificaciones[estudiante.id]) {
            nuevasCalificaciones[estudiante.id] = {};
            actividades.forEach((actividad) => {
              nuevasCalificaciones[estudiante.id][actividad.id] = "";
            });
          } else {
            // Si el estudiante existe, asegurar que tenga todas las actividades
            actividades.forEach((actividad) => {
              if (
                nuevasCalificaciones[estudiante.id][actividad.id] === undefined
              ) {
                nuevasCalificaciones[estudiante.id][actividad.id] = "";
              }
            });
          }
        });

        return nuevasCalificaciones;
      });
    }
  }, [estudiantes, actividades, calificacionesContext]);

  // Función principal de validación
  const validateCalificacionesData = (
    calificaciones: Calificacion[],
    estudiantes: Estudiante[],
    actividades: Actividad[],
  ) => {
    const validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
      statistics: {
        totalStudents: estudiantes.length,
        studentsWithGrades: 0,
        studentsWithCompleteGrades: 0,
        totalActivities: actividades.length,
        missingGrades: 0,
        invalidGrades: 0,
      },
    };

    // 1. Validar estructura básica
    if (!Array.isArray(calificaciones)) {
      validation.errors.push("Calificaciones debe ser un array");
      validation.isValid = false;

      return validation;
    }

    if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
      validation.errors.push("No hay estudiantes para validar");
      validation.isValid = false;

      return validation;
    }

    if (!Array.isArray(actividades) || actividades.length === 0) {
      validation.errors.push("No hay actividades definidas");
      validation.isValid = false;

      return validation;
    }

    // 2. Crear mapas para búsqueda rápida
    const estudiantesMap = new Map(estudiantes.map((est) => [est.id, est]));
    const calificacionesMap = new Map(
      calificaciones.map((cal) => [cal.estudiante_id, cal]),
    );

    // 3. Validar cada estudiante
    estudiantes.forEach((estudiante) => {
      const calificacion = calificacionesMap.get(estudiante.id);

      if (!calificacion) {
        validation.warnings.push(
          `Estudiante ${estudiante.nombre_completo} no tiene calificaciones`,
        );

        return;
      }

      validation.statistics.studentsWithGrades++;

      // Validar estructura de calificación
      if (calificacion.estudiante_id !== estudiante.id) {
        validation.errors.push(
          `ID inconsistente para ${estudiante.nombre_completo}`,
        );
        validation.isValid = false;
      }

      // Validar notas del estudiante
      const notasMap = new Map(
        calificacion.notas.map((nota) => [nota.actividad_id, nota]),
      );
      let completeGrades = true;

      actividades.forEach((actividad) => {
        const nota = notasMap.get(actividad.id);

        if (!nota) {
          validation.warnings.push(
            `${estudiante.nombre_completo}: falta nota para ${actividad.nombre}`,
          );
          validation.statistics.missingGrades++;
          completeGrades = false;

          return;
        }

        // Validar rango de la nota (0-5)
        if (nota.valor < 0 || nota.valor > 5) {
          validation.errors.push(
            `${estudiante.nombre_completo}: nota inválida (${nota.valor}) en ${actividad.nombre}`,
          );
          validation.statistics.invalidGrades++;
          validation.isValid = false;
        }

        // Validar porcentaje
        if (nota.porcentaje !== actividad.porcentaje) {
          validation.warnings.push(
            `${estudiante.nombre_completo}: porcentaje inconsistente en ${actividad.nombre}`,
          );
        }
      });

      if (completeGrades) {
        validation.statistics.studentsWithCompleteGrades++;
      }

      if (!calificacion.estudiante_id) return;

      // Validar nota final calculada
      const notaCalculada: number = calcularNotaFinal(
        calificacion.estudiante_id,
      );
      const diferencia = Math.abs(notaCalculada - calificacion.notaFinal);

      if (diferencia > 0.1) {
        // Tolerancia de 0.1 por redondeo
        validation.warnings.push(
          `${estudiante.nombre_completo}: nota final inconsistente (registrada: ${calificacion.notaFinal}, calculada: ${notaCalculada.toFixed(2)})`,
        );
      }
    });

    // 4. Validar que no hay calificaciones huérfanas
    calificaciones.forEach((calificacion) => {
      if (calificacion.estudiante_id)
        if (!estudiantesMap.has(calificacion.estudiante_id)) {
          validation.errors.push(
            `Calificación huérfana para estudiante ID: ${calificacion.estudiante_id}`,
          );
          validation.isValid = false;
        }
    });

    // 5. Validar suma de porcentajes
    const totalPorcentaje = actividades.reduce(
      (sum, act) => sum + act.porcentaje,
      0,
    );

    if (Math.abs(totalPorcentaje - 100) > 0.1) {
      validation.errors.push(
        `Los porcentajes de actividades no suman 100% (suma: ${totalPorcentaje}%)`,
      );
      validation.isValid = false;
    }

    return validation;
  };

  // Verificar si hay notas para mostrar advertencia
  const hayNotasSinCompletar = () => {
    let incompleto = false;

    Object.keys(calificaciones).forEach((estudianteId) => {
      Object.keys(calificaciones[estudianteId]).forEach((actividadId) => {
        if (calificaciones[estudianteId][actividadId] === "") {
          incompleto = true;
        }
      });
    });

    return incompleto;
  };

  // Renderizado - Mostrar loading mientras carga
  if (!curso) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  // Verificar porcentajes
  const porcentajes = verificarPorcentajes();

  // SOLUCIÓN 4: Definir todas las columnas en un array
  const allColumns = [
    <TableColumn
      key="estudiante"
      className="bg-gray-50 sticky left-0 z-10 min-w-[150px]"
    >
      Estudiante
    </TableColumn>,
    ...(actividades?.map((actividad) => (
      <TableColumn key={actividad.id}>
        <div className="text-center whitespace-normal px-1">
          <div className="font-medium">{actividad.nombre}</div>
          <div className="text-xs text-gray-500">
            {actividad.porcentaje.toFixed(1)}%
          </div>
        </div>
      </TableColumn>
    )) || []),
    <TableColumn key="nota-final">Nota Final</TableColumn>,
  ];

  return (
    <div className="space-y-6 p-4 md:p-10">
      {/* Header Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center w-full">
            <div>
              <h1 className="text-xl md:text-2xl uppercase font-bold text-blue-600">
                Curso - {curso.nombre} {area ? `/ ${area.nombre}` : ""}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Chip color="primary" size="sm" variant="flat">
                  {estudiantes.length} estudiantes
                </Chip>
                <Chip color="secondary" size="sm" variant="flat">
                  {actividades?.length || 0} actividades
                </Chip>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <Select
                className="w-full md:w-40"
                label="Periodo"
                selectedKeys={[periodoSeleccionado.toString()]}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string;

                  handlePeriodoChange(key);
                }}
              >
                <SelectItem key="1">Periodo 1</SelectItem>
                <SelectItem key="2">Periodo 2</SelectItem>
                <SelectItem key="3">Periodo 3</SelectItem>
                <SelectItem key="4">Periodo 4</SelectItem>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alertas y Mensajes */}
      {error && (
        <Card className="border border-red-200 bg-red-50">
          <CardBody className="py-3">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </CardBody>
        </Card>
      )}

      {hayNotasSinCompletar() && (
        <Card className="border border-yellow-200 bg-yellow-50">
          <CardBody className="py-3">
            <div className="flex items-start gap-2 text-yellow-700">
              <WarningIcon />
              <div>
                <p className="font-medium">
                  Hay estudiantes con notas sin completar
                </p>
                <p className="text-sm mt-1">
                  Las notas vacías serán calculadas como 0 al guardar
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {!porcentajes.esValido && (
        <Card className="border border-orange-200 bg-orange-50">
          <CardBody className="py-4">
            <div className="flex items-start gap-3 text-orange-700">
              <div className="flex-1">
                <p className="font-medium mb-2">
                  ⚠️ Los porcentajes no están correctamente distribuidos
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  <div className="bg-white p-2 rounded border">
                    <span className="text-xs text-gray-600">
                      Actividades regulares
                    </span>
                    <p className="font-semibold">
                      {porcentajes.totalRegulares.toFixed(1)}% / 70%
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-xs text-gray-600">
                      Evaluación final
                    </span>
                    <p className="font-semibold">
                      {porcentajes.totalFinal.toFixed(1)}% / 30%
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-xs text-gray-600">Total</span>
                    <p className="font-semibold">
                      {porcentajes.total.toFixed(1)}% / 100%
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full sm:w-auto"
                  color="warning"
                  size="sm"
                  startContent={<CalculatorIcon />}
                  onPress={recalcularPorcentajes}
                >
                  Redistribuir porcentajes automáticamente
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Gestión de Actividades */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 w-full">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Actividades de Evaluación
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configura las actividades y sus porcentajes de evaluación
              </p>
            </div>
            <Button
              className="w-full sm:w-auto"
              color="primary"
              startContent={<EditIcon />}
              variant={editando ? "flat" : "light"}
              onPress={() => setEditando(!editando)}
            >
              {editando ? "Cancelar Edición" : "Editar Actividades"}
            </Button>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="pt-4">
          {editando && (
            <div className="mb-6">
              <Card className="bg-gray-50 border">
                <CardBody className="p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Actividades Configuradas
                  </h3>
                  <div className="overflow-x-auto mb-4">
                    <Table
                      removeWrapper
                      aria-label="Tabla de actividades"
                      classNames={{
                        td: "px-3 py-3",
                        th: "bg-gray-100 text-gray-700 font-semibold",
                      }}
                    >
                      <TableHeader>
                        <TableColumn>NOMBRE</TableColumn>
                        <TableColumn>PORCENTAJE</TableColumn>
                        <TableColumn className="hidden sm:table-cell">
                          TIPO
                        </TableColumn>
                        <TableColumn>ACCIONES</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {actividades.map((actividad) => (
                          <TableRow
                            key={actividad.id}
                            className={
                              actividad.isFinal ? "bg-blue-50" : "bg-white"
                            }
                          >
                            <TableCell className="font-medium">
                              {actividad.nombre}
                            </TableCell>
                            <TableCell>
                              <Chip
                                color={
                                  actividad.isFinal ? "primary" : "success"
                                }
                                size="sm"
                                variant="flat"
                              >
                                {actividad.porcentaje.toFixed(1)}%
                              </Chip>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Chip
                                color={
                                  actividad.isFinal ? "primary" : "default"
                                }
                                size="sm"
                                variant="dot"
                              >
                                {actividad.isFinal
                                  ? "Evaluación Final"
                                  : "Actividad Regular"}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              {!actividad.isFinal && (
                                <Button
                                  color="danger"
                                  size="sm"
                                  variant="light"
                                  onPress={() =>
                                    handleEliminarActividad(actividad.id)
                                  }
                                >
                                  Eliminar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Divider className="my-4" />

                  <div>
                    <h4 className="text-md font-semibold mb-3 text-gray-700">
                      Añadir Nueva Actividad
                    </h4>
                    <div className="flex flex-col items-center sm:flex-row gap-3">
                      <Input
                        className="flex-1"
                        label="Nombre de la actividad"
                        placeholder="Ej: Taller 3, Quiz 2"
                        value={nuevaActividad.nombre}
                        variant="bordered"
                        onValueChange={(val) =>
                          setNuevaActividad({ ...nuevaActividad, nombre: val })
                        }
                      />
                      <Button
                        className="w-full sm:w-auto"
                        color="primary"
                        startContent={<PlusIcon />}
                        onPress={handleAddActividad}
                      >
                        Añadir Actividad
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Distribución de porcentajes actual */}
          <div>
            <h3 className="text-md font-semibold mb-3 text-gray-700">
              Distribución Actual de Porcentajes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {actividades.map((actividad) => (
                <div
                  key={actividad.id}
                  className={`p-3 rounded-lg border ${
                    actividad.isFinal
                      ? "bg-blue-50 border-blue-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">
                      {actividad.nombre}
                    </span>
                    <Chip
                      color={actividad.isFinal ? "primary" : "success"}
                      size="sm"
                      variant="flat"
                    >
                      {actividad.porcentaje.toFixed(1)}%
                    </Chip>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Actividades regulares:</span>
                  <span className="font-semibold">
                    {porcentajes.totalRegulares.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Evaluación final:</span>
                  <span className="font-semibold">
                    {porcentajes.totalFinal.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span
                    className={`font-semibold ${porcentajes.esValido ? "text-green-600" : "text-red-600"}`}
                  >
                    {porcentajes.total.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabla de Calificaciones */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Registro de Calificaciones
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Ingresa las calificaciones de cada estudiante para todas las
                actividades
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Chip color="primary" size="sm" variant="flat">
                {estudiantes.length} estudiantes
              </Chip>
            </div>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="pt-4">
          {estudiantes.length > 0 ? (
            <div>
              <Table
                isHeaderSticky
                removeWrapper
                aria-label="Tabla de calificaciones"
                classNames={{
                  base: "max-h-[600px]",
                  table: "min-h-[150px] min-w-[640px]",
                  th: "bg-gray-50 text-gray-700 font-semibold",
                }}
              >
                <TableHeader>{allColumns}</TableHeader>
                <TableBody>
                  {estudiantes.map((estudiante) => {
                    const allCells = [
                      <TableCell
                        key="estudiante"
                        className="font-medium sticky left-0 bg-white min-w-[150px] border-r"
                      >
                        <div className="flex items-center gap-2">
                          <span>{estudiante.nombre_completo}</span>
                        </div>
                      </TableCell>,
                      ...(actividades?.map((actividad) => (
                        <TableCell
                          key={`${estudiante.id}-${actividad.id}`}
                          className="text-center"
                        >
                          <input
                            className="w-16 p-2 border rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            max="5"
                            min="0"
                            step="0.1"
                            type="number"
                            value={
                              calificaciones[estudiante.id]?.[actividad.id] ||
                              ""
                            }
                            onChange={(e) =>
                              handleCalificacionChange(
                                estudiante.id,
                                actividad.id,
                                e.target.value,
                              )
                            }
                          />
                        </TableCell>
                      )) || []),
                      <TableCell
                        key="nota-final"
                        className="text-center font-bold"
                      >
                        <Chip
                          color={
                            calcularNotaFinal(estudiante.id) >= 3.5
                              ? "success"
                              : calcularNotaFinal(estudiante.id) >= 3.0
                                ? "warning"
                                : "danger"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {calcularNotaFinal(estudiante.id)}
                        </Chip>
                      </TableCell>,
                    ];

                    return (
                      <TableRow
                        key={estudiante.id}
                        className="hover:bg-gray-50"
                      >
                        {allCells}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay estudiantes registrados
              </h3>
              <p className="text-gray-600">
                No se encontraron estudiantes para este curso
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Botones de Acción */}
      <Card className="shadow-sm">
        <CardBody className="py-4">
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button
              className="w-full sm:w-auto"
              color="danger"
              radius="sm"
              variant="light"
              onPress={() => router.back()}
            >
              Volver
            </Button>
            <Button
              className="w-full sm:w-auto"
              color="primary"
              isDisabled={!porcentajes.esValido}
              isLoading={loading || guardandoCalificaciones}
              radius="sm"
              startContent={
                !loading && !guardandoCalificaciones ? (
                  <CheckCircle className="w-4 h-4" />
                ) : null
              }
              onPress={handleGuardarCalificaciones}
            >
              {loading || guardandoCalificaciones
                ? "Guardando..."
                : "Guardar Calificaciones"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SistemaCalificaciones;
