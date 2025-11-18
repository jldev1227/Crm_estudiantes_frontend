"use client";

import React, { createContext, useContext, useReducer } from "react";
import { useApolloClient } from "@apollo/client";

import { OBTENER_CURSOS } from "../graphql/queries/obtenerCursos";
import { OBTENER_CURSO_GENERAL } from "../graphql/queries/obtenerCursoGeneral";
import { ACTUALIZAR_PENSION } from "../graphql/mutation/actualizarPension";
import { ACTUALIZAR_VER_CALIFICACIONES } from "../graphql/mutation/actualizarVerCalificaciones";
import { OBTENER_MAESTROS } from "../graphql/queries/obtenerMaestros";
import { OBTENER_ESTADISTICAS_ADMIN } from "../graphql/queries/ObtenerEstadisticasAdmin";
import { OBTENER_ESTUDIANTES } from "../graphql/queries/obtenerEstudiantes";
import { CREAR_ESTUDIANTE } from "../graphql/mutation/crearEstudiante";
import { CAMBIAR_GRADO_ESTUDIANTE } from "../graphql/mutation/cambiarGradoEstudiante";
import { CAMBIAR_GRADO_ESTUDIANTES_MASIVO } from "../graphql/mutation/cambiarGradoEstudiantesMasivo";
import { OBTENER_CALIFICACIONES_GRADO_COMPLETO } from "../graphql/queries/obtenerCalificacionesGradoCompleto";

import { useAuth } from "./AuthContext";

import { Curso, Estudiante, EstudianteInput, Maestro } from "@/types";

// Tipos para la respuesta actual de obtenerCalificacionesGradoCompleto
interface CalificacionesGradoCompletoResponse {
  grado?: {
    id: string;
    nombre: string;
  } | null;
  calificaciones: CalificacionItem[];
}

interface CalificacionItem {
  area: {
    id: string;
    nombre: string;
  };
  notaFinal: number;
  estudiante: {
    id: string;
    tipo_documento?: string;
    nombre_completo: string;
    numero_identificacion?: string;
  };
}

interface Estadisticas {
  totalEstudiantes: number;
  totalMaestros: number;
  totalActividades: number;
  totalTareas: number;
  totalCalificaciones: number;
  totalGrados: number;
  totalAreas: number;
  totalUsuarios: number;
}

interface AdminContextType {
  cursos: Curso[];
  curso: Curso | null;
  maestros: Maestro[];
  estudiantes: Estudiante[];
  estadisticas: Estadisticas;
  calificacionesGrado: CalificacionesGradoCompletoResponse | null; // Calificaciones completas del grado
  periodoSeleccionado: number;
  estaCargando: boolean;
  error: string | null;
  obtenerCursos: () => void;
  obtenerEstadisticas: () => void;
  obtenerMaestros: () => void;
  obtenerEstudiantes: () => void;
  obtenerCalificaciones: (
    grado_id: number,
    periodo: number,
  ) => Promise<CalificacionesGradoCompletoResponse | void>;
  obtenerCurso: (id: number) => void;
  crearEstudiante: (estudiante: EstudianteInput) => void;
  cambiarGradoEstudiante: (
    id: string,
    grado_id: string,
  ) => Promise<Estudiante | void>;
  cambiarGradoEstudiantesMasivo: (
    estudiante_ids: string[],
    grado_id: string,
  ) => Promise<any>;
  actualizarPension: (id: number) => void;
  actualizarVerCalificaciones: (id: number) => void;
  establecerPeriodo: (periodo: number) => void;
  limpiarError: () => void;
}

// Estado inicial
const initialState = {
  cursos: [],
  curso: null,
  maestros: [],
  estudiantes: [],
  estaCargando: false,
  calificaciones: null, // Calificaciones completas del grado
  calificacionesGrado: null,
  estadisticas: {
    totalEstudiantes: 0,
    totalMaestros: 0,
    totalActividades: 0,
    totalTareas: 0,
    totalCalificaciones: 0,
    totalGrados: 0,
    totalAreas: 0,
    totalUsuarios: 0,
  }, // estadisticas
  periodoSeleccionado: 1, // Periodo seleccionado por defecto
  error: null,
};

// Reducer
const adminReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        estaCargando: action.payload,
        error: null, // Limpiar error al empezar nueva operación
      };
    case "SET_ERROR":
      return {
        ...state,
        estaCargando: false,
        error: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "OBTENER_CURSOS":
      return {
        ...state,
        cursos: action.payload,
        estaCargando: false,
        error: null,
      };
    case "OBTENER_MAESTROS":
      return {
        ...state,
        maestros: action.payload,
        estaCargando: false,
        error: null,
      };
    case "OBTENER_ESTUDIANTES":
      return {
        ...state,
        estudiantes: action.payload,
        estaCargando: false,
        error: null,
      };
    case "OBTENER_CURSO_GENERAL":
      return {
        ...state,
        curso: action.payload,
        estaCargando: false,
        error: null,
      };
    case "OBTENER_CALIFICACIONES":
      return {
        ...state,
        calificaciones: action.payload,
        estaCargando: false,
        error: null,
      };
    case "OBTENER_CALIFICACIONES_GRADO_COMPLETO":
      return {
        ...state,
        calificacionesGrado: action.payload,
        estaCargando: false,
        error: null,
      };
    case "OBTENER_ESTADISTICAS":
      return {
        ...state,
        estadisticas: action.payload,
        estaCargando: false,
        error: null,
      };
    case "ACTUALIZAR_PENSION":
      if (!state.curso) return { ...state, estaCargando: false };

      return {
        ...state,
        estaCargando: false,
        error: null,
        curso: {
          ...state.curso,
          estudiantes: state.curso.estudiantes.map((estudiante: Estudiante) =>
            estudiante.id === action.payload.id
              ? { ...estudiante, pension_activa: !estudiante.pension_activa }
              : estudiante,
          ),
        },
      };
    case "ACTUALIZAR_VER_CALIFICACIONES":
      if (!state.curso) return { ...state, estaCargando: false };

      return {
        ...state,
        estaCargando: false,
        error: null,
        curso: {
          ...state.curso,
          estudiantes: state.curso.estudiantes.map((estudiante: Estudiante) =>
            estudiante.id === action.payload.id
              ? {
                  ...estudiante,
                  ver_calificaciones: !estudiante.ver_calificaciones,
                }
              : estudiante,
          ),
        },
      };
    case "CAMBIAR_GRADO_ESTUDIANTE":
      return {
        ...state,
        estaCargando: false,
        error: null,
      };
    case "CAMBIAR_GRADO_ESTUDIANTES_MASIVO":
      return {
        ...state,
        estaCargando: false,
        error: null,
      };
    case "ESTABLECER_PERIODO":
      return {
        ...state,
        periodoSeleccionado: action.payload,
        // Limpiar calificaciones al cambiar período para forzar nueva carga
        calificacionesGrado: null,
      };
    case "ERROR":
      return {
        ...state,
        estaCargando: false,
        error: "Ha ocurrido un error inesperado",
      };
    default:
      return state;
  }
};

// Crear el contexto
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Provider Component
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const { usuario } = useAuth();

  // Obtenemos instancia de Apollo Client
  const client = useApolloClient();

  // Función que ejecuta la query y despacha la acción para guardar los cursos
  const obtenerCursos = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data } = await client.query({
        query: OBTENER_CURSOS,
      });

      dispatch({
        type: "OBTENER_CURSOS",
        payload: data.obtenerCursos,
      });
    } catch (error) {
      console.error("Error obteniendo cursos:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al cargar los cursos",
      });
    }
  };

  // Función que ejecuta la query y despacha la acción para guardar las estadisticas
  const obtenerEstadisticas = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data } = await client.query({
        query: OBTENER_ESTADISTICAS_ADMIN,
      });

      dispatch({
        type: "OBTENER_ESTADISTICAS",
        payload: data.obtenerEstadisticasAdmin,
      });
    } catch (error) {
      console.error("Error obteniendo estadisticas:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al cargar las estadisticas",
      });
    }
  };

  // Función que ejecuta la query y despacha la acción para obtener un curso específico
  const obtenerCurso = async (id: number) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data } = await client.query({
        query: OBTENER_CURSO_GENERAL,
        variables: { id },
      });

      dispatch({
        type: "OBTENER_CURSO_GENERAL",
        payload: data.obtenerCursoGeneral,
      });
    } catch (error) {
      console.error("Error obteniendo curso:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al cargar el curso",
      });
    }
  };

  // Función que ejecuta la mutation y despacha la acción para actualizar la pension del estudiante
  const actualizarPension = async (id: number) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data } = await client.mutate({
        mutation: ACTUALIZAR_PENSION,
        variables: { id },
      });

      dispatch({
        type: "ACTUALIZAR_PENSION",
        payload: { id: data.actualizarPension.id },
      });
    } catch (error) {
      console.error("Error actualizando pensión:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al actualizar la pensión",
      });
    }
  };

  // Función que ejecuta la mutation y despacha la acción para actualizar la pension del estudiante
  const actualizarVerCalificaciones = async (id: number) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data } = await client.mutate({
        mutation: ACTUALIZAR_VER_CALIFICACIONES,
        variables: { id },
      });

      dispatch({
        type: "ACTUALIZAR_VER_CALIFICACIONES",
        payload: { id: data.actualizarVerCalificaciones.id },
      });
    } catch (error) {
      console.error("Error actualizando ver calificaciones:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al actualizar ver calificaciones",
      });
    }
  };

  // Función que ejecuta la query y despacha la acción para guardar los maestros
  const obtenerMaestros = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data } = await client.query({
        query: OBTENER_MAESTROS,
      });

      dispatch({
        type: "OBTENER_MAESTROS",
        payload: data.obtenerMaestros,
      });
    } catch (error) {
      console.error("Error obteniendo maestros:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al cargar los maestros",
      });
    }
  };

  // Función principal: obtener calificaciones completas del grado
  const obtenerCalificaciones = async (
    grado_id: number,
    periodo: number,
  ): Promise<CalificacionesGradoCompletoResponse | void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      console.group("[ADMIN] Obtener calificaciones (grado completo)");
      console.info("Variables:", { grado_id, periodo });
      console.info("Usuario:", {
        id: usuario?.id,
        rol: usuario?.rol,
        ver_calificaciones: usuario?.ver_calificaciones,
        tokenPresent:
          typeof window !== "undefined" &&
          Boolean(localStorage.getItem("token")),
      });
      const { data } = await client.query({
        query: OBTENER_CALIFICACIONES_GRADO_COMPLETO,
        variables: { grado_id, periodo },
        fetchPolicy: "network-only", // Para asegurar datos frescos
        errorPolicy: "all",
      });

      if (data?.obtenerCalificacionesGradoCompleto) {
        const count =
          data.obtenerCalificacionesGradoCompleto?.calificaciones?.length || 0;

        console.info("Respuesta recibida:", {
          grado: data.obtenerCalificacionesGradoCompleto?.grado?.nombre,
          calificaciones: count,
        });
        dispatch({
          type: "OBTENER_CALIFICACIONES_GRADO_COMPLETO",
          payload: data.obtenerCalificacionesGradoCompleto,
        });

        return data.obtenerCalificacionesGradoCompleto;
      } else {
        throw new Error("No se recibieron datos de calificaciones");
      }
    } catch (error) {
      console.error("Error obteniendo calificaciones del grado:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al cargar las calificaciones del grado",
      });
      throw error; // Re-lanzar el error para manejarlo en el componente
    } finally {
      console.groupEnd();
    }
  };

  // Funcion para obtener los estudiantes
  const obtenerEstudiantes = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data } = await client.query({
        query: OBTENER_ESTUDIANTES,
      });

      if (!data?.obtenerEstudiantes) {
        throw new Error("No se recibieron datos de estudiantes");
      }

      dispatch({
        type: "OBTENER_ESTUDIANTES",
        payload: data.obtenerEstudiantes,
      });

      return data.obtenerEstudiantes;
    } catch (error) {
      console.error("Error obteniendo estudiantes:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al cargar los estudiantes",
      });
    }
  };

  // Función que ejecuta la mutation y despacha la acción para actualizar la pension del estudiante
  const crearEstudiante = async (estudianteNuevo: EstudianteInput) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data } = await client.mutate({
        mutation: CREAR_ESTUDIANTE,
        variables: {
          nombre_completo: estudianteNuevo.nombre_completo,
          celular_padres: estudianteNuevo.celular_padres,
          numero_identificacion: estudianteNuevo.numero_identificacion,
          fecha_nacimiento: estudianteNuevo.fecha_nacimiento,
          tipo_documento: estudianteNuevo.tipo_documento,
          password:
            estudianteNuevo.password || estudianteNuevo.numero_identificacion,
          grado_id: estudianteNuevo.grado_id,
        }, // ✅ Ahora coincide con la mutación
      });

      dispatch({
        type: "CREAR_ESTUDIANTE",
        payload: { id: data.registrarEstudiante.id }, // ⚠️ Cambiar de actualizarPension a registrarEstudiante
      });
    } catch (error) {
      console.error("Error creando estudiante:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al crear el estudiante",
      });
    }
  };

  // Función para cambiar el grado de un estudiante individual
  const cambiarGradoEstudiante = async (
    id: string,
    grado_id: string,
  ): Promise<Estudiante | void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data } = await client.mutate({
        mutation: CAMBIAR_GRADO_ESTUDIANTE,
        variables: { id, grado_id },
      });

      dispatch({
        type: "CAMBIAR_GRADO_ESTUDIANTE",
        payload: data.cambiarGradoEstudiante,
      });

      return data.cambiarGradoEstudiante;
    } catch (error) {
      console.error("Error cambiando grado del estudiante:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al cambiar el grado del estudiante",
      });
      throw error;
    }
  };

  // Función para cambiar el grado de múltiples estudiantes
  const cambiarGradoEstudiantesMasivo = async (
    estudiante_ids: string[],
    grado_id: string,
  ) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data } = await client.mutate({
        mutation: CAMBIAR_GRADO_ESTUDIANTES_MASIVO,
        variables: { estudiante_ids, grado_id },
      });

      dispatch({
        type: "CAMBIAR_GRADO_ESTUDIANTES_MASIVO",
        payload: data.cambiarGradoEstudiantesMasivo,
      });

      return data.cambiarGradoEstudiantesMasivo;
    } catch (error) {
      console.error("Error cambiando grado de estudiantes masivo:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al cambiar el grado de los estudiantes",
      });
      throw error;
    }
  };

  // Función para establecer el periodo
  const establecerPeriodo = (periodo: number) => {
    dispatch({
      type: "ESTABLECER_PERIODO",
      payload: periodo,
    });
  };

  // Función para limpiar errores
  const limpiarError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Valores del contexto
  const contextValue: AdminContextType = {
    // Estados
    cursos: state.cursos,
    curso: state.curso,
    maestros: state.maestros,
    estudiantes: state.estudiantes,
    estadisticas: state.estadisticas,
    estaCargando: state.estaCargando,
    calificacionesGrado: state.calificacionesGrado, // Calificaciones completas del grado
    periodoSeleccionado: state.periodoSeleccionado,
    error: state.error,

    // Funciones
    obtenerCursos,
    obtenerEstadisticas,
    obtenerCurso,
    obtenerCalificaciones, // Función principal para calificaciones
    obtenerMaestros,
    obtenerEstudiantes,
    crearEstudiante,
    cambiarGradoEstudiante,
    cambiarGradoEstudiantesMasivo,
    actualizarPension,
    actualizarVerCalificaciones,
    establecerPeriodo,
    limpiarError,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAdmin = () => {
  const context = useContext(AdminContext);

  if (context === undefined) {
    throw new Error("useAdmin debe ser usado dentro de un AdminProvider");
  }

  return context;
};
