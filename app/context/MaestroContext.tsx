"use client";
import React, { createContext, useReducer, useContext } from "react";
import { useApolloClient } from "@apollo/client";
import { OBTENER_CURSOS_MAESTRO } from "../graphql/queries/obtenerCursosMaestro";
import { OBTENER_CURSO } from "../graphql/queries/obtenerCurso";
import { OBTENER_CALIFICACIONES } from "../graphql/queries/obtenerCalificaciones";

// Estado inicial
const initialState = {
  cursos: [],
  curso: null, // Para un curso específico
  area: null, // Para un área específica
  calificaciones: null, // Para las calificaciones
  periodoSeleccionado: 1, // Periodo seleccionado por defecto
};

// Reducer
const maestroReducer = (state: any, action: any) => {
  switch (action.type) {
    case "OBTENER_CURSOS_MAESTRO":
      return {
        ...state,
        cursos: action.payload,
      };
    case "OBTENER_CURSO":
      return {
        ...state,
        curso: action.payload.curso,
        area: action.payload.area,
      };
    case "OBTENER_CALIFICACIONES":
      return {
        ...state,
        calificaciones: action.payload,
      };
    case "ESTABLECER_PERIODO":
      return {
        ...state,
        periodoSeleccionado: action.payload,
      };
    default:
      return state;
  }
};

// Crear el contexto
const MaestroContext = createContext<any>(initialState);

// Proveedor del contexto
export function MaestroProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(maestroReducer, initialState);

  // Obtenemos instancia de Apollo Client
  const client = useApolloClient();

  // Función que ejecuta la query y despacha la acción para guardar los cursos
  const obtenerCursosMaestro = async () => {
    try {
      const { data } = await client.query({
        query: OBTENER_CURSOS_MAESTRO,
      });

      dispatch({
        type: "OBTENER_CURSOS_MAESTRO",
        payload: data.obtenerAsignacionesMaestro,
      });
    } catch (error) {
      console.error("Error obteniendo cursos:", error);
    }
  };

  // Función para obtener un curso específico con su área
  const obtenerCurso = async (id: string, area_id: string) => {
    try {
      const { data } = await client.query({
        query: OBTENER_CURSO,
        variables: { id, area_id },
      });

      dispatch({
        type: "OBTENER_CURSO",
        payload: {
          curso: data.obtenerCurso,
          area: data.obtenerCurso.area,
        },
      });

      return data.obtenerCurso;
    } catch (error) {
      console.error("Error obteniendo curso:", error);
    }
  };

  // Función para obtener calificaciones
  const obtenerCalificaciones = async (grado_id: string, area_id: string, periodo: number) => {
    try {
      const { data } = await client.query({
        query: OBTENER_CALIFICACIONES,
        variables: { grado_id, area_id, periodo },
        fetchPolicy: "network-only" // Para asegurar datos frescos
      });

      dispatch({
        type: "OBTENER_CALIFICACIONES",
        payload: data.obtenerCalificaciones,
      });

      return data.obtenerCalificaciones;
    } catch (error) {
      console.error("Error obteniendo calificaciones:", error);
    }
  };

  // Función para establecer el periodo
  const establecerPeriodo = (periodo: number) => {
    dispatch({
      type: "ESTABLECER_PERIODO",
      payload: periodo,
    });
  };

  return (
    <MaestroContext.Provider
      value={{
        cursos: state.cursos,
        curso: state.curso,
        area: state.area,
        calificaciones: state.calificaciones,
        periodoSeleccionado: state.periodoSeleccionado,
        obtenerCursosMaestro,
        obtenerCurso,
        obtenerCalificaciones,
        establecerPeriodo,
      }}
    >
      {children}
    </MaestroContext.Provider>
  );
}

// Hook para usar el contexto
export const useMaestro = () => useContext(MaestroContext);