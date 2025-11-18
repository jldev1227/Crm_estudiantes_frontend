"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Plus, Trash2, XCircle } from "lucide-react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";

import { Calificacion, Estudiante } from "@/types";
import { GUARDAR_CALIFICACIONES } from "@/app/graphql/mutation/guardarCalificaciones";
import { useMaestro } from "@/app/context/MaestroContext";
import { OBTENER_INDICADORES } from "@/app/graphql/queries/obtenerIndicadores";

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

// Estilos tipo glass minimalista (inspirado en Apple)
const GLASS_CARD =
  "bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg ring-1 ring-black/5";

type Actividad = {
  id: string;
  nombre: string;
  porcentaje: number;
  isFinal: boolean;
};

type ValorQualitative = "DS" | "DA" | "DB" | "SP";

type Indicador = {
  id: number;
  nombre: string;
};

const SistemaCalificaciones = () => {
  const params = useParams();
  const router = useRouter();
  const grado_id = params?.curso as string;
  const area_id = params?.area as string;

  // Constants
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

  const [editandoActividad, setEditandoActividad] = useState<string | null>(
    null,
  );
  const [nombreTemporal, setNombreTemporal] = useState<string>("");

  const iniciarEdicionActividad = (
    actividadId: string,
    nombreActual: string,
  ) => {
    setEditandoActividad(actividadId);
    setNombreTemporal(nombreActual);
  };

  const cancelarEdicionActividad = () => {
    setEditandoActividad(null);
    setNombreTemporal("");
  };

  const guardarNombreActividad = (actividadId: string) => {
    if (!nombreTemporal.trim()) {
      toast.error("El nombre de la actividad no puede estar vacío");

      return;
    }

    // Actualizar solo el nombre de la actividad, manteniendo todo lo demás
    setActividades((prev) =>
      prev.map((actividad) =>
        actividad.id === actividadId
          ? { ...actividad, nombre: nombreTemporal.trim() }
          : actividad,
      ),
    );

    // Limpiar el estado de edición
    setEditandoActividad(null);
    setNombreTemporal("");

    toast.success("Nombre de actividad actualizado correctamente");
  };

  const CONVERSION_CUALITATIVA: Record<ValorQualitative, number> = {
    DS: 5.0, // Desempeño Superior
    DA: 4.0, // Desempeño Alto
    DB: 3.5, // Desempeño Básico
    SP: 3.0, // Sin Presentar
  };

  const GRADOS_CUALITATIVOS = ["PARVULOS", "PREJARDIN", "JARDIN", "TRANSICIÓN"];

  // Función para obtener el color según la calificación cualitativa
  const obtenerColorCalificacion = (
    calificacion: string,
  ): "success" | "primary" | "warning" | "danger" | "default" | "secondary" => {
    switch (calificacion) {
      case "DS":
        return "success"; // Verde
      case "DA":
        return "primary"; // Azul
      case "DB":
        return "warning"; // Naranja
      case "SP":
        return "danger"; // Rojo
      default:
        return "default"; // Gris
    }
  };

  // Función para obtener el nombre completo de la calificación
  const obtenerNombreCalificacion = (calificacion: string): string => {
    switch (calificacion) {
      case "DS":
        return "Desempeño Superior";
      case "DA":
        return "Desempeño Alto";
      case "DB":
        return "Desempeño Básico";
      case "SP":
        return "Sin Presentar";
      default:
        return "";
    }
  };

  // Estados locales
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [nextId, setNextId] = useState(1);
  const [actividades, setActividades] = useState<Actividad[]>([]);
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

  // NUEVO ESTADO: Checkbox para evaluación final opcional
  const [incluirEvaluacionFinal, setIncluirEvaluacionFinal] = useState(true);

  // Función para agregar un nuevo indicador
  const agregarIndicador = () => {
    const nuevoIndicador = {
      id: nextId,
      nombre: "",
    };

    setIndicadores([...indicadores, nuevoIndicador]);
    setNextId(nextId + 1);
  };

  // Función para actualizar el nombre de un indicador
  const actualizarIndicador = (id: number, nombre: string) => {
    setIndicadores(
      indicadores.map((indicador) =>
        indicador.id === id ? { ...indicador, nombre } : indicador,
      ),
    );
  };
  // Función para eliminar un indicador
  const eliminarIndicador = (id: number) => {
    setIndicadores(indicadores.filter((indicador) => indicador.id !== id));
  };

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

  const { loading: loadingIndicadores, error: errorIndicadores } = useQuery(
    OBTENER_INDICADORES,
    {
      variables: {
        gradoId: parseInt(grado_id), // Convertir a Int
        areaId: parseInt(area_id), // Convertir a Int
        periodo: parseInt(periodoSeleccionado), // Convertir a Int
      },
      skip: !grado_id || !area_id || !periodoSeleccionado, // No ejecutar si faltan variables
      onCompleted: (data) => {
        // Cuando la query se complete, actualizar el estado local
        if (data) {
          setIndicadores(
            data.obtenerIndicadores.data.map((indicador: Indicador) => ({
              id: indicador.id,
              nombre: indicador.nombre,
            })),
          );
        }
      },
    },
  );

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

  const isCualitativo = useCallback(() => {
    // Verificar si el GRADO/CURSO es cualitativo, no el área
    return GRADOS_CUALITATIVOS.includes(curso?.nombre);
  }, [curso]);

  // También actualiza la función convertirNotaACualitativa para manejar valores por debajo de 3.0
  const convertirNotaACualitativa = (nota: number): string => {
    if (nota >= 4.6) return "DS"; // Desempeño Superior
    if (nota >= 4.0) return "DA"; // Desempeño Alto
    if (nota >= 3.5) return "DB"; // Desempeño Básico
    if (nota >= 3.0) return "SP"; // Sigue en proceso

    return "SP"; // Para notas menores a 3.0, también "Sigue en proceso"
  };

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

  // EFECTO MODIFICADO: Manejar el cambio del checkbox de evaluación final
  useEffect(() => {
    // Solo ejecutar si hay actividades cargadas para evitar ejecuciones prematuras
    if (actividades.length === 0) return;

    const evaluacionesFinal = actividades.filter((act) => act.isFinal);
    const tieneEvaluacionFinal = evaluacionesFinal.length > 0;

    if (incluirEvaluacionFinal && !tieneEvaluacionFinal) {
      // AGREGAR evaluación final
      const nuevaEvaluacionFinal = {
        id: "final",
        nombre: "Evaluación Final",
        porcentaje: FINAL_EVALUATION_PERCENTAGE,
        isFinal: true,
      };

      // Redistribuir porcentajes de actividades regulares
      const actividadesRegulares = actividades.filter((act) => !act.isFinal);

      // CALCULAR CORRECTAMENTE EL PORCENTAJE PARA ACTIVIDADES REGULARES
      const porcentajeRegular =
        actividadesRegulares.length > 0
          ? (100 - FINAL_EVALUATION_PERCENTAGE) / actividadesRegulares.length
          : 70; // valor por defecto

      const actividadesActualizadas = [
        ...actividadesRegulares.map((act) => ({
          ...act,
          porcentaje: Math.round(porcentajeRegular * 100) / 100, // Redondear a 2 decimales
        })),
        nuevaEvaluacionFinal,
      ];

      setActividades(actividadesActualizadas);

      // Actualizar las calificaciones para incluir la nueva evaluación final
      setCalificaciones((prev) => {
        const nuevasCalificaciones = { ...prev };

        Object.keys(nuevasCalificaciones).forEach((estudianteId) => {
          if (nuevasCalificaciones[estudianteId]) {
            nuevasCalificaciones[estudianteId] = {
              ...nuevasCalificaciones[estudianteId],
              [nuevaEvaluacionFinal.id]: "",
            };
          }
        });

        return nuevasCalificaciones;
      });

      toast.success(
        `Evaluación final añadida. Actividades regulares: ${porcentajeRegular.toFixed(1)}% cada una.`,
      );
    } else if (!incluirEvaluacionFinal && tieneEvaluacionFinal) {
      // ELIMINAR evaluación final
      const actividadesSinFinal = actividades.filter((act) => !act.isFinal);

      if (actividadesSinFinal.length > 0) {
        const porcentajeRegular = 100 / actividadesSinFinal.length;
        const actividadesActualizadas = actividadesSinFinal.map((act) => ({
          ...act,
          porcentaje: Math.round(porcentajeRegular * 100) / 100, // Redondear a 2 decimales
        }));

        setActividades(actividadesActualizadas);
      } else {
        // Si no hay actividades regulares, crear una actividad por defecto
        setActividades([
          {
            id: "act1",
            nombre: "Actividad 1",
            porcentaje: 100,
            isFinal: false,
          },
        ]);
      }

      // Eliminar las calificaciones de las actividades finales
      setCalificaciones((prev) => {
        const nuevasCalificaciones = { ...prev };

        Object.keys(nuevasCalificaciones).forEach((estudianteId) => {
          if (nuevasCalificaciones[estudianteId]) {
            const calificacionesEstudiante = {
              ...nuevasCalificaciones[estudianteId],
            };

            evaluacionesFinal.forEach((actFinal) => {
              delete calificacionesEstudiante[actFinal.id];
            });
            nuevasCalificaciones[estudianteId] = calificacionesEstudiante;
          }
        });

        return nuevasCalificaciones;
      });

      toast.success(
        "Evaluación final eliminada. Porcentajes redistribuidos automáticamente.",
      );
    } else if (tieneEvaluacionFinal && evaluacionesFinal.length > 1) {
      // CASO ESPECIAL: Si hay múltiples evaluaciones finales, mantener solo una
      const primeraEvaluacionFinal = evaluacionesFinal[0];
      const evaluacionesFinalesExtras = evaluacionesFinal.slice(1);

      const actividadesFiltradas = actividades.filter(
        (act) => !act.isFinal || act.id === primeraEvaluacionFinal.id,
      );

      setActividades(actividadesFiltradas);

      // Limpiar calificaciones de las evaluaciones finales extras
      setCalificaciones((prev) => {
        const nuevasCalificaciones = { ...prev };

        Object.keys(nuevasCalificaciones).forEach((estudianteId) => {
          if (nuevasCalificaciones[estudianteId]) {
            const calificacionesEstudiante = {
              ...nuevasCalificaciones[estudianteId],
            };

            evaluacionesFinalesExtras.forEach((actFinal) => {
              delete calificacionesEstudiante[actFinal.id];
            });
            nuevasCalificaciones[estudianteId] = calificacionesEstudiante;
          }
        });

        return nuevasCalificaciones;
      });

      toast.error(
        "Se mantuvo solo una evaluación final. Se eliminaron las evaluaciones finales adicionales.",
      );
    }
  }, [incluirEvaluacionFinal]);

  // Efecto para cargar calificaciones existentes desde el contexto - MODIFICADO
  useEffect(() => {
    if (calificacionesContext && Array.isArray(calificacionesContext)) {
      // Filtrar solo las calificaciones del período actual
      const calificacionesPeriodoActual = calificacionesContext.filter(
        (calificacion: any) => calificacion.periodo === periodoSeleccionado,
      );

      if (calificacionesPeriodoActual.length > 0) {
        // Extraer todas las actividades únicas de las calificaciones existentes
        // Cambiar a Set<string> para manejar IDs como strings
        const actividadesExistentes = new Set<string>();
        const actividadesInfo = new Map<
          string, // Cambiar de number a string
          { nombre: string; porcentaje: number }
        >();

        calificacionesPeriodoActual.forEach((calificacion: Calificacion) => {
          calificacion.notas.forEach((nota: any) => {
            // Cambiar a any para evitar conflicto de tipos
            // Convertir actividad_id a string para consistencia
            const actividadIdStr = nota.actividad_id.toString();

            actividadesExistentes.add(actividadIdStr);
            actividadesInfo.set(actividadIdStr, {
              nombre: nota.nombre,
              porcentaje: nota.porcentaje,
            });
          });
        });

        // Crear array de actividades basado en las calificaciones existentes
        const nuevasActividades: Actividad[] = [];
        let contadorEvaluacionesFinal = 0;

        actividadesExistentes.forEach((actividadId) => {
          const info = actividadesInfo.get(actividadId);

          if (info) {
            const esFinal = actividadId === "final";

            // Solo permitir una evaluación final
            if (esFinal) {
              contadorEvaluacionesFinal++;
              if (contadorEvaluacionesFinal > 1) {
                return; // Saltar evaluaciones finales adicionales
              }
            }

            nuevasActividades.push({
              id: actividadId, // Ya es string
              nombre: info.nombre,
              porcentaje: info.porcentaje,
              isFinal: esFinal,
            });
          }
        });

        // Verificar si hay evaluación final en las actividades existentes y actualizar el checkbox
        const tieneEvaluacionFinal = nuevasActividades.some(
          (act) => act.isFinal,
        );

        // IMPORTANTE: Actualizar el estado del checkbox ANTES de establecer las actividades
        // para evitar que se ejecute el efecto del checkbox cuando no debería
        if (tieneEvaluacionFinal !== incluirEvaluacionFinal) {
          setIncluirEvaluacionFinal(tieneEvaluacionFinal);
        }

        setActividades(nuevasActividades);

        // Mapear las calificaciones a la estructura local
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

        // Llenar con los valores existentes
        calificacionesPeriodoActual.forEach((calificacion: any) => {
          const estudianteId = calificacion.estudiante_id.toString();

          if (nuevasCalificaciones[estudianteId]) {
            calificacion.notas.forEach((nota: any) => {
              if (
                nota.actividad_id &&
                nota.valor !== undefined &&
                nota.valor !== null
              ) {
                // Convertir actividad_id a string para consistencia
                const actividadIdStr = nota.actividad_id.toString();

                // Solo asignar si la actividad existe en nuevasActividades
                if (
                  nuevasActividades.some((act) => act.id === actividadIdStr)
                ) {
                  nuevasCalificaciones[estudianteId][actividadIdStr] =
                    nota.valor.toString();
                }
              }
            });
          }
        });

        setCalificaciones(nuevasCalificaciones);
      } else {
        // Si no hay calificaciones para este período, usar configuración por defecto
        // Resetear actividades a las por defecto según el estado del checkbox
        const actividadesPorDefecto = isCualitativo()
          ? [
              {
                id: "nota-unica",
                nombre: "Nota Única",
                porcentaje: 100,
                isFinal: false,
              },
            ]
          : incluirEvaluacionFinal
            ? [
                {
                  id: "final",
                  nombre: "Evaluación Final",
                  porcentaje: 30,
                  isFinal: true,
                },
              ]
            : [
                {
                  id: "act1",
                  nombre: "Actividad 1",
                  porcentaje: 100,
                  isFinal: false,
                },
              ];

        setActividades(actividadesPorDefecto);

        // Inicializar calificaciones vacías para todos los estudiantes
        const calificacionesVacias: {
          [estudianteId: string]: { [actividadId: string]: string };
        } = {};

        estudiantes.forEach((estudiante) => {
          calificacionesVacias[estudiante.id] = {};
          actividadesPorDefecto.forEach((actividad) => {
            calificacionesVacias[estudiante.id][actividad.id] = "";
          });
        });
        setCalificaciones(calificacionesVacias);
      }
    }
  }, [calificacionesContext, periodoSeleccionado, estudiantes]); // Remover incluirEvaluacionFinal de las dependencias

  // Efecto para sincronizar calificaciones cuando cambian estudiantes o actividades
  useEffect(() => {
    // Solo ejecutar si hay estudiantes y actividades, y evitar ciclos infinitos
    if (estudiantes.length === 0 || actividades.length === 0) return;

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

      // Solo actualizar si hay cambios reales
      const hayChangios =
        JSON.stringify(prev) !== JSON.stringify(nuevasCalificaciones);

      return hayChangios ? nuevasCalificaciones : prev;
    });
  }, [estudiantes.length, actividades.map((a) => a.id).join(",")]); // Dependencias más específicas

  // Función distribuirPorcentajes - MODIFICADA para manejar evaluación final opcional
  const distribuirPorcentajes = useCallback(
    (
      actividadesRegulares: Actividad[],
      actividadesFinal: Actividad[],
    ): Actividad[] => {
      if (actividadesRegulares.length === 0) {
        return [...actividadesFinal]; // Devolver solo las actividades finales si no hay regulares
      }

      // Para actividades finales, SIEMPRE asignar 30% si el ID es "final"
      const actividadesFinalesCorregidas = actividadesFinal.map((act) => {
        if (act.id === "final") {
          return { ...act, porcentaje: 30 }; // FORZAR 30% para evaluación final
        }

        return act;
      });

      // Calcular el porcentaje disponible para actividades regulares
      const porcentajeFinal = actividadesFinalesCorregidas.reduce(
        (sum, act) => sum + act.porcentaje,
        0,
      );
      const porcentajeDisponible = 100 - porcentajeFinal;

      if (porcentajeDisponible <= 0) {
        console.warn("No hay porcentaje disponible para actividades regulares");

        return [...actividadesRegulares, ...actividadesFinalesCorregidas];
      }

      // El nuevo porcentaje para cada actividad regular
      const nuevoPorcentaje =
        porcentajeDisponible / actividadesRegulares.length;

      // Actualizar los porcentajes de las actividades regulares
      const nuevasActividadesRegulares: Actividad[] = actividadesRegulares.map(
        (act: Actividad) => ({
          ...act,
          porcentaje: Math.round(nuevoPorcentaje * 100) / 100, // Redondear a 2 decimales
        }),
      );

      return [...nuevasActividadesRegulares, ...actividadesFinalesCorregidas];
    },
    [],
  );

  // Función mejorada para manejar el cambio de período
  const handlePeriodoChange = (periodo: string) => {
    const periodoNumerico = parseInt(periodo);

    establecerPeriodo(periodoNumerico);

    // Limpiar calificaciones al cambiar de período
    setCalificaciones({});

    // Resetear actividades a las por defecto según el estado del checkbox
    const actividadesPorDefecto = isCualitativo()
      ? [
          {
            id: "nota-unica",
            nombre: "Nota Única",
            porcentaje: 100,
            isFinal: false,
          },
        ]
      : incluirEvaluacionFinal
        ? [
            {
              id: "final",
              nombre: "Evaluación Final",
              porcentaje: 30,
              isFinal: true,
            },
          ]
        : [
            {
              id: "act1",
              nombre: "Actividad 1",
              porcentaje: 100,
              isFinal: false,
            },
          ];

    setActividades(actividadesPorDefecto);

    // Cargar calificaciones del nuevo período
    if (grado_id && area_id) {
      obtenerCalificaciones(grado_id, area_id, periodoNumerico);
    }
  };

  const validarYCorregirPorcentajes = useCallback(() => {
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
    const total = totalRegulares + totalFinal;

    // Si el total no es 100%, redistribuir automáticamente
    if (Math.abs(total - 100) > 0.1) {
      const nuevasActividades = distribuirPorcentajes(
        actividadesRegulares,
        actividadesFinal,
      );

      setActividades(nuevasActividades);

      return true; // Indica que se hizo una corrección
    }

    return false; // No se necesitó corrección
  }, [actividades, distribuirPorcentajes]);

  useEffect(() => {
    // Solo ejecutar después de que se hayan cargado las calificaciones del contexto
    if (calificacionesContext && actividades.length > 0 && !isCualitativo()) {
      const timeout = setTimeout(() => {
        const seCorrigio = validarYCorregirPorcentajes();
      }, 500); // Pequeño delay para evitar conflictos

      return () => clearTimeout(timeout);
    }
  }, [
    calificacionesContext,
    actividades.length,
    validarYCorregirPorcentajes,
    isCualitativo,
  ]);

  const recalcularPorcentajes = () => {
    const actividadesRegulares = actividades.filter((act) => !act.isFinal);
    const actividadesFinal = actividades.filter((act) => act.isFinal);

    if (actividadesRegulares.length === 0) {
      toast.error("No hay actividades regulares para redistribuir");

      return;
    }

    // Obtener porcentajes antes de la redistribución
    const totalAntes = actividades.reduce(
      (sum, act) => sum + act.porcentaje,
      0,
    );

    // Distribuir porcentajes y actualizar actividades
    const nuevasActividades = distribuirPorcentajes(
      actividadesRegulares,
      actividadesFinal,
    );

    setActividades(nuevasActividades);

    const totalDespues = nuevasActividades.reduce(
      (sum, act) => sum + act.porcentaje,
      0,
    );

    toast.success(
      `Porcentajes redistribuidos: ${totalAntes.toFixed(1)}% → ${totalDespues.toFixed(1)}%`,
    );
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

  // Añadir nueva actividad - MODIFICADO
  const handleAddActividad = () => {
    if (!nuevaActividad.nombre) {
      toast.error("Ingrese nombre para la nueva actividad");

      return;
    }

    // Separar actividades regulares de la evaluación final
    const actividadesRegulares: Actividad[] = actividades.filter(
      (act) => act.id !== "final", // Cambio aquí: usar ID en lugar de isFinal
    );
    const actividadesFinal: Actividad[] = actividades.filter(
      (act) => act.id === "final", // Cambio aquí: usar ID en lugar de isFinal
    );

    // Crear la nueva actividad (siempre será regular)
    const nuevaActividadObj: Actividad = {
      id: `act${Date.now()}`,
      nombre: nuevaActividad.nombre,
      porcentaje: 0, // Se calculará automáticamente
      isFinal: false,
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

    // Reiniciar el formulario
    setNuevaActividad({ nombre: "", porcentaje: "" });
    toast.success(
      `Actividad "${nuevaActividad.nombre}" añadida. Porcentajes redistribuidos automáticamente.`,
    );
  };

  // 2. Actualizar la función handleEliminarActividad:
  const handleEliminarActividad = (actividadId: string) => {
    if (actividades.length <= 1) {
      toast.error("Debe haber al menos una actividad");

      return;
    }

    // No permitir eliminar la evaluación final directamente
    if (actividadId === "final") {
      toast.error(
        "No se puede eliminar la evaluación final directamente. Use el checkbox para deshabilitarla.",
      );

      return;
    }

    // Separar actividades regulares de la evaluación final
    const actividadesRegulares = actividades.filter(
      (act) => act.id !== "final",
    );
    const actividadesFinal = actividades.filter((act) => act.id === "final");

    // Eliminar la actividad de las actividades regulares
    const nuevasActividadesRegulares = actividadesRegulares.filter(
      (act) => act.id !== actividadId,
    );

    if (
      nuevasActividadesRegulares.length === 0 &&
      actividadesFinal.length === 0
    ) {
      toast.error("Debe haber al menos una actividad");

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

  // Guardar calificaciones
  const handleGuardarCalificaciones = async () => {
    setLoading(true);
    setError("");

    try {
      const calificacionesSubmit = estudiantes.map((estudiante) => ({
        estudiante_id: estudiante.id,
        notas: actividades.map((actividad) => {
          const estudianteNotas = calificaciones[estudiante.id] || {};
          const valorStr = estudianteNotas[actividad.id] || "0";

          return {
            actividad_id: actividad.id,
            nombre: actividad.nombre,
            valor: parseFloat(valorStr),
            porcentaje: actividad.porcentaje,
          };
        }),
      }));

      await guardarCalificaciones({
        variables: {
          input: {
            grado_id,
            area_id,
            periodo: periodoSeleccionado,
            calificaciones: calificacionesSubmit,
            indicadores: indicadores, // Pasar los indicadores
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
    const actividadesRegulares = actividades.filter(
      (act) => act.id !== "final",
    );
    const actividadesFinal = actividades.filter((act) => act.id === "final");

    const totalRegulares = actividadesRegulares.reduce(
      (sum, act) => sum + act.porcentaje,
      0,
    );
    const totalFinal = actividadesFinal.reduce(
      (sum, act) => sum + act.porcentaje,
      0,
    );
    const total = totalRegulares + totalFinal;

    // Calcular lo que debería ser según la configuración
    const totalEsperado = 100;
    const finalEsperado = actividadesFinal.length > 0 ? 30 : 0; // Basado en si existe "final"
    const regularEsperado = totalEsperado - finalEsperado;

    return {
      totalRegulares,
      totalFinal,
      total,
      esValido: Math.abs(total - 100) < 0.1,
      diferencia: total - 100,
      regularEsperado,
      finalEsperado,
      totalEsperado,
      necesitaCorreccion: Math.abs(total - 100) > 0.1,
    };
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
  if (!curso || loading || loadingIndicadores) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  // Verificar porcentajes
  const porcentajes = verificarPorcentajes();
  const actividadesOrdenadas = actividades.slice().sort((a, b) => {
    if (!a.isFinal && b.isFinal) return -1;
    if (a.isFinal && !b.isFinal) return 1;

    return a.nombre.localeCompare(b.nombre);
  });

  return (
    <div className="space-y-6 p-4 mx-auto">
      {/* Header Card */}
      <Card className={GLASS_CARD}>
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
      {error ||
        (errorIndicadores && (
          <Card className={`${GLASS_CARD} border-red-200/40 bg-red-50/50`}>
            <CardBody className="py-3">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">
                  {error || errorIndicadores.message}
                </span>
              </div>
            </CardBody>
          </Card>
        ))}

      {hayNotasSinCompletar() && (
        <Card className={`${GLASS_CARD} border-yellow-200/40 bg-yellow-50/50`}>
          <CardBody className="py-3">
            <div className="flex items-start gap-2 text-yellow-700">
              <WarningIcon />
              <div>
                <p className="font-medium">
                  Hay estudiantes con notas sin completar
                </p>
                <p className="text-sm mt-1">
                  {!isCualitativo()
                    ? "Las notas vacías serán calculadas como 0 al guardar"
                    : 'Las notas vacías seran guardadas como "Sigue en Proceso"'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {!porcentajes.esValido && !isCualitativo() && (
        <Card className={`${GLASS_CARD} border-orange-200/40 bg-orange-50/50`}>
          <CardBody className="py-4">
            <div className="flex items-start gap-3 text-orange-700">
              <div className="flex-1">
                <p className="font-medium mb-2">
                  ⚠️ Los porcentajes no están correctamente distribuidos
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md p-2 rounded border border-white/20">
                    <span className="text-xs text-gray-600">
                      Actividades regulares
                    </span>
                    <p className="font-semibold">
                      {porcentajes.totalRegulares.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md p-2 rounded border border-white/20">
                    <span className="text-xs text-gray-600">
                      Evaluación final
                    </span>
                    <p className="font-semibold">
                      {porcentajes.totalFinal.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md p-2 rounded border border-white/20">
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

      <Card className={GLASS_CARD}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 w-full">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Indicadores de Logros
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Registra los indicadores de logros
              </p>
            </div>
            {indicadores.length === 0 && (
              <Button
                className="w-full sm:w-auto"
                color="primary"
                startContent={<Plus size={16} />}
                onPress={agregarIndicador}
              >
                Agregar Indicador
              </Button>
            )}
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-4">
          {indicadores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay indicadores agregados</p>
              <Button
                color="primary"
                startContent={<Plus size={16} />}
                variant="flat"
                onPress={agregarIndicador}
              >
                Agregar primer indicador
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {indicadores.map((indicador, index) => (
                <div key={indicador.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      classNames={{
                        input: "text-sm",
                        label: "text-sm font-medium",
                      }}
                      label={`Indicador ${index + 1}`}
                      placeholder="Escribe el nombre del indicador..."
                      value={indicador.nombre}
                      variant="bordered"
                      onValueChange={(value) =>
                        actualizarIndicador(indicador.id, value)
                      }
                    />
                  </div>

                  <Button
                    isIconOnly
                    className="mt-2"
                    color="danger"
                    size="sm"
                    variant="flat"
                    onPress={() => eliminarIndicador(indicador.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}

              {/* Botón para agregar más indicadores al final de la lista */}
              <div className="pt-3 border-t border-gray-200">
                <Button
                  className="w-full sm:w-auto"
                  color="primary"
                  startContent={<Plus size={16} />}
                  variant="flat"
                  onPress={agregarIndicador}
                >
                  Agregar otro indicador
                </Button>
              </div>
            </div>
          )}

          {/* Resumen de indicadores */}
          {indicadores.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Resumen ({indicadores.length} indicadores)
              </h3>
              <div className="space-y-1">
                {indicadores.map((indicador, index) => (
                  <div key={indicador.id} className="text-sm text-gray-600">
                    {index + 1}. {indicador.nombre}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Gestión de Actividades */}

      <Card className={GLASS_CARD}>
        <CardHeader className="pb-3">
          {!isCualitativo() && (
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 w-full">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Actividades de Evaluación
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configura las actividades y sus porcentajes de evaluación
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* CHECKBOX PARA EVALUACIÓN FINAL */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    color="primary"
                    isSelected={incluirEvaluacionFinal}
                    size="sm"
                    onValueChange={setIncluirEvaluacionFinal}
                  >
                    <span className="text-sm text-gray-700">
                      Incluir Evaluación Final
                    </span>
                  </Checkbox>
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
            </div>
          )}
          {isCualitativo() && (
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 w-full">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Evaluación Cualitativa
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configura las actividades cualitativas sin porcentajes
                </p>
              </div>
            </div>
          )}
        </CardHeader>

        <Divider />

        <CardBody className="pt-4">
          {/* Información sobre la evaluación final */}
          {!incluirEvaluacionFinal && !isCualitativo() && (
            <Card
              className={`${GLASS_CARD} bg-blue-50/50 border border-blue-300/40 mb-4`}
            >
              <CardBody className="py-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">
                      Modo: Solo Actividades Regulares
                    </p>
                    <p className="text-sm">
                      Las actividades regulares representarán el 100% de la
                      calificación
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {isCualitativo() && (
            <Card
              className={`${GLASS_CARD} bg-purple-50/50 border border-purple-300/40 mb-4`}
            >
              <CardBody className="py-3">
                <div className="flex items-center gap-2 text-purple-700">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Modo: Solo Nota Cualitativa</p>
                    <p className="text-sm">
                      Las actividades regulares no tienen porcentaje asignado,
                      solo se registra una nota cualitativa
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {incluirEvaluacionFinal && !isCualitativo() && (
            <Card
              className={`${GLASS_CARD} bg-green-50/50 border border-green-200/40 mb-4`}
            >
              <CardBody className="py-3">
                <div className="flex items-center gap-2 text-green-700">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Modo: Con Evaluación Final</p>
                    <p className="text-sm">
                      Actividades regulares: 70% | Evaluación final: 30%
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {editando && !isCualitativo() && (
            <div className="mb-6">
              <Card
                className={`${GLASS_CARD} bg-gray-50/60 border border-gray-200/40`}
              >
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
                              {editandoActividad === actividad.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    classNames={{
                                      input: "text-sm",
                                      inputWrapper: "min-h-[32px] h-8",
                                    }}
                                    size="sm"
                                    value={nombreTemporal}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        guardarNombreActividad(actividad.id);
                                      } else if (e.key === "Escape") {
                                        cancelarEdicionActividad();
                                      }
                                    }}
                                    onValueChange={setNombreTemporal}
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span>{actividad.nombre}</span>
                                </div>
                              )}
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
                              {editandoActividad === actividad.id ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    color="success"
                                    size="sm"
                                    variant="flat"
                                    onPress={() =>
                                      guardarNombreActividad(actividad.id)
                                    }
                                  >
                                    ✓
                                  </Button>
                                  <Button
                                    color="danger"
                                    size="sm"
                                    variant="flat"
                                    onPress={cancelarEdicionActividad}
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  {/* MODIFICADO: Permitir editar tanto actividades regulares como finales */}
                                  <Button
                                    color="primary"
                                    size="sm"
                                    variant="light"
                                    onPress={() =>
                                      iniciarEdicionActividad(
                                        actividad.id,
                                        actividad.nombre,
                                      )
                                    }
                                  >
                                    Editar
                                  </Button>
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
                                  {actividad.isFinal && (
                                    <span className="text-xs text-gray-500">
                                      Use el checkbox para deshabilitarla
                                    </span>
                                  )}
                                </div>
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
                      Añadir Nueva Actividad Regular
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
                    <p className="text-xs text-gray-500 mt-2">
                      * Las nuevas actividades siempre serán actividades
                      regulares. Solo puede haber una evaluación final.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Distribución de porcentajes actual */}
          {!isCualitativo() && (
            <div>
              <h3 className="text-md font-semibold mb-3 text-gray-700">
                Distribución Actual de Porcentajes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {actividades
                  .sort((a, b) => {
                    // Primero ordena por tipo: regulares (false) antes que finales (true)
                    if (!a.isFinal && b.isFinal) return -1; // Regular antes que final
                    if (a.isFinal && !b.isFinal) return 1; // Final después que regular

                    return a.nombre.localeCompare(b.nombre); // Alfabético si son del mismo tipo
                  })
                  .map((actividad) => (
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

              <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-3 rounded-lg border border-white/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Actividades regulares:
                    </span>
                    <span className="font-semibold">
                      {porcentajes.totalRegulares.toFixed(1)}%
                    </span>
                  </div>
                  {incluirEvaluacionFinal && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Evaluación final:</span>
                      <span className="font-semibold">
                        {porcentajes.totalFinal.toFixed(1)}%
                      </span>
                    </div>
                  )}
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
          )}
        </CardBody>
      </Card>

      {/* Registro de Calificaciones - Diseño en tarjetas (sin tablas) */}
      <Card className={GLASS_CARD}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Registro de Calificaciones
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Ingresa las calificaciones de cada estudiante en un formato
                compacto y amigable para móvil.
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
            <>
              {/* Card mode (mobile) */}
              <div className="block md:hidden">
                <div className="grid grid-cols-1 gap-4">
                  {estudiantes.map((estudiante) => (
                    <div
                      key={estudiante.id}
                      className="rounded-xl border border-white/20 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md p-4 shadow-sm"
                    >
                      {/* Cabecera del estudiante */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {estudiante.nombre_completo}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {isCualitativo() ? (
                            <Chip
                              color={obtenerColorCalificacion(
                                convertirNotaACualitativa(
                                  calcularNotaFinal(estudiante.id),
                                ),
                              )}
                              size="sm"
                              variant="flat"
                            >
                              {convertirNotaACualitativa(
                                calcularNotaFinal(estudiante.id),
                              )}
                            </Chip>
                          ) : (
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
                          )}
                        </div>
                      </div>

                      {/* Controles de actividades */}
                      <div className="mt-4 space-y-3">
                        {actividadesOrdenadas.map((actividad) => (
                          <div
                            key={actividad.id}
                            className="rounded-lg border border-white/20 bg-white/50 dark:bg-zinc-900/30 backdrop-blur p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {actividad.nombre}
                                </p>
                                {!isCualitativo() && (
                                  <p className="text-[11px] text-gray-500">
                                    {actividad.porcentaje.toFixed(1)}%
                                    {actividad.isFinal
                                      ? " • Evaluación Final"
                                      : ""}
                                  </p>
                                )}
                              </div>
                              <div className="shrink-0">
                                {isCualitativo() ? (
                                  <Select
                                    aria-label="Calificación cualitativa"
                                    classNames={{
                                      base: "min-w-[96px]",
                                      trigger: "h-9 min-h-[36px]",
                                      value: "text-center font-medium",
                                      popoverContent: "min-w-[140px]",
                                    }}
                                    placeholder="--"
                                    selectedKeys={
                                      calificaciones[estudiante.id]?.[
                                        actividad.id
                                      ]
                                        ? [
                                            convertirNotaACualitativa(
                                              parseFloat(
                                                calificaciones[estudiante.id][
                                                  actividad.id
                                                ],
                                              ),
                                            ),
                                          ]
                                        : []
                                    }
                                    variant="bordered"
                                    onSelectionChange={(keys) => {
                                      const valorCualitativo = Array.from(
                                        keys,
                                      )[0] as string;
                                      const valorNumerico =
                                        CONVERSION_CUALITATIVA[
                                          valorCualitativo as ValorQualitative
                                        ];

                                      handleCalificacionChange(
                                        estudiante.id,
                                        actividad.id,
                                        valorNumerico?.toString() || "",
                                      );
                                    }}
                                  >
                                    <SelectItem
                                      key="DS"
                                      textValue="DS - Desempeño Superior"
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-medium text-green-600">
                                          DS
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          Superior
                                        </span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem
                                      key="DA"
                                      textValue="DA - Desempeño Alto"
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-medium text-blue-600">
                                          DA
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          Alto
                                        </span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem
                                      key="DB"
                                      textValue="DB - Desempeño Básico"
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-medium text-warning-600">
                                          DB
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          Básico
                                        </span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem
                                      key="SP"
                                      textValue="SP - Sigue en proceso"
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-medium text-red-600">
                                          SP
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          Sigue en proceso
                                        </span>
                                      </div>
                                    </SelectItem>
                                  </Select>
                                ) : (
                                  <input
                                    className="w-20 h-9 px-2 border border-gray-300 rounded-md text-center bg-white/90 dark:bg-zinc-900/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    max={5}
                                    min={0}
                                    step={0.1}
                                    type="number"
                                    value={
                                      calificaciones[estudiante.id]?.[
                                        actividad.id
                                      ] || ""
                                    }
                                    onChange={(e) =>
                                      handleCalificacionChange(
                                        estudiante.id,
                                        actividad.id,
                                        e.target.value,
                                      )
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Canvas table (desktop) */}
              <div className="hidden md:block">
                <div className="overflow-auto rounded-xl border border-white/20 bg-white/40 dark:bg-zinc-900/30 backdrop-blur">
                  <table className="min-w-[900px] w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 sticky left-0 bg-white/70 dark:bg-zinc-900/60 backdrop-blur z-20 min-w-[200px]">
                          Estudiante
                        </th>
                        {actividadesOrdenadas.map((actividad) => (
                          <th
                            key={actividad.id}
                            className="px-3 py-3 text-center font-semibold text-gray-700 whitespace-nowrap"
                          >
                            <div className="flex flex-col items-center gap-1 max-w-[230px]">
                              <span
                                className="block w-full truncate"
                                title={actividad.nombre}
                              >
                                {actividad.nombre &&
                                actividad.nombre.length > 30
                                  ? `${actividad.nombre.slice(0, 30)}…`
                                  : actividad.nombre}
                              </span>
                              {!isCualitativo() && (
                                <span className="text-[11px] text-gray-500">
                                  {actividad.porcentaje.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="px-3 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">
                          Nota Final
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map((estudiante) => (
                        <tr
                          key={estudiante.id}
                          className="odd:bg-white/40 even:bg-white/20 dark:odd:bg-zinc-900/20"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white/60 dark:bg-zinc-900/40 backdrop-blur z-10">
                            {estudiante.nombre_completo}
                          </td>
                          {actividadesOrdenadas.map((actividad) => (
                            <td
                              key={`${estudiante.id}-${actividad.id}`}
                              className="px-3 py-2 text-center"
                            >
                              {isCualitativo() ? (
                                <Select
                                  aria-label="Calificación cualitativa"
                                  classNames={{
                                    base: "min-w-[100px]",
                                    trigger: "h-9 min-h-[36px]",
                                    value: "text-center font-medium",
                                  }}
                                  placeholder="--"
                                  selectedKeys={
                                    calificaciones[estudiante.id]?.[
                                      actividad.id
                                    ]
                                      ? [
                                          convertirNotaACualitativa(
                                            parseFloat(
                                              calificaciones[estudiante.id][
                                                actividad.id
                                              ],
                                            ),
                                          ),
                                        ]
                                      : []
                                  }
                                  variant="bordered"
                                  onSelectionChange={(keys) => {
                                    const valorCualitativo = Array.from(
                                      keys,
                                    )[0] as string;
                                    const valorNumerico =
                                      CONVERSION_CUALITATIVA[
                                        valorCualitativo as ValorQualitative
                                      ];

                                    handleCalificacionChange(
                                      estudiante.id,
                                      actividad.id,
                                      valorNumerico?.toString() || "",
                                    );
                                  }}
                                >
                                  <SelectItem key="DS">DS</SelectItem>
                                  <SelectItem key="DA">DA</SelectItem>
                                  <SelectItem key="DB">DB</SelectItem>
                                  <SelectItem key="SP">SP</SelectItem>
                                </Select>
                              ) : (
                                <input
                                  className="w-20 h-9 px-2 border border-gray-300 rounded-md text-center bg-white/90 dark:bg-zinc-900/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  max={5}
                                  min={0}
                                  step={0.1}
                                  type="number"
                                  value={
                                    calificaciones[estudiante.id]?.[
                                      actividad.id
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleCalificacionChange(
                                      estudiante.id,
                                      actividad.id,
                                      e.target.value,
                                    )
                                  }
                                />
                              )}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center">
                            {isCualitativo() ? (
                              <Chip
                                color={obtenerColorCalificacion(
                                  convertirNotaACualitativa(
                                    calcularNotaFinal(estudiante.id),
                                  ),
                                )}
                                size="sm"
                                variant="flat"
                              >
                                {convertirNotaACualitativa(
                                  calcularNotaFinal(estudiante.id),
                                )}
                              </Chip>
                            ) : (
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
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
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
      <Card className={GLASS_CARD}>
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
              isDisabled={!porcentajes.esValido && !isCualitativo()}
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

            <p />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SistemaCalificaciones;
