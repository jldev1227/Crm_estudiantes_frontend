"use client";

import React, { createContext, useContext, useState, useEffect, useReducer } from "react";
import { useApolloClient } from "@apollo/client";
import { OBTENER_CURSOS } from "../graphql/queries/obtenerCursos";
import { OBTENER_CURSO_GENERAL } from "../graphql/queries/obtenerCursoGeneral";
import { Curso, Estudiante, Maestro } from "@/types";
import { ACTUALIZAR_PENSION } from "../graphql/mutation/actualizarPension";
import { OBTENER_MAESTROS } from "../graphql/queries/obtenerMaestros";

interface AdminContextType {
  cursos: Curso[];
  curso: Curso | null;
  maestros: Maestro[];
  estaCargando: boolean;
  obtenerCursos: () => void;
  obtenerMaestros: () => void;
  obtenerCurso: (id: string) => void;
  actualizarPension: (id: string) => void;
}

// Estado inicial
const initialState = {
  cursos: [],
  curso: null,
  maestros: [],
  estaCargando: false,
};

// Reducer
const adminReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        estaCargando: action.payload,
      };
    case "OBTENER_CURSOS":
      return {
        ...state,
        cursos: action.payload,
        estaCargando: false,
      };
    case "OBTENER_MAESTROS":
      return {
        ...state,
        maestros: action.payload,
        estaCargando: false,
      };
    case "OBTENER_CURSO_GENERAL":
      return {
        ...state,
        curso: action.payload,
        estaCargando: false,
      };
    case "ACTUALIZAR_PENSION":
      if (!state.curso) return { ...state, estaCargando: false };

      return {
        ...state,
        estaCargando: false,
        curso: {
          ...state.curso,
          estudiantes: state.curso.estudiantes.map((estudiante: Estudiante) => 
            estudiante.id === action.payload.id 
              ? { ...estudiante, pension_activa: !estudiante.pension_activa } 
              : estudiante
          )
        }
      };
    case "ERROR":
      return {
        ...state,
        estaCargando: false,
      };
    default:
      return state;
  }
};

// Crear el contexto
const AdminContext = createContext<AdminContextType | undefined>(
  undefined,
);

// Provider Component
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Obtenemos instancia de Apollo Client
  const client = useApolloClient();

  // Función que ejecuta la query y despacha la acción para guardar los cursos
  const obtenerCursos = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      const { data } = await client.query({
        query: OBTENER_CURSOS
      });

      console.log(data);

      dispatch({
        type: "OBTENER_CURSOS",
        payload: data.obtenerCursos,
      });
    } catch (error) {
      console.error("Error obteniendo cursos:", error);
      dispatch({ type: "ERROR" });
    }
  };

  // Función que ejecuta la query y despacha la acción para obtener un curso específico
  const obtenerCurso = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      const { data } = await client.query({
        query: OBTENER_CURSO_GENERAL,
        variables: { id }
      });

      dispatch({
        type: "OBTENER_CURSO_GENERAL",
        payload: data.obtenerCursoGeneral,
      });
    } catch (error) {
      console.error("Error obteniendo curso:", error);
      dispatch({ type: "ERROR" });
    }
  };

  // Función que ejecuta la mutation y despacha la acción para actualizar la pension del estudiante
  const actualizarPension = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      const { data } = await client.mutate({
        mutation: ACTUALIZAR_PENSION,
        variables: { id }
      });

      console.log(data.actualizarPension);

      dispatch({
        type: "ACTUALIZAR_PENSION",
        payload: { id: data.actualizarPension.id },
      });
    } catch (error) {
      console.error("Error actualizando pensión:", error);
      dispatch({ type: "ERROR" });
    }
  };

  // Función que ejecuta la query y despacha la acción para guardar los maestros
  const obtenerMaestros = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      const { data } = await client.query({
        query: OBTENER_MAESTROS
      });

      dispatch({
        type: "OBTENER_MAESTROS",
        payload: data.obtenerMaestros,
      });
    } catch (error) {
      console.error("Error obteniendo maestros:", error);
      dispatch({ type: "ERROR" });
    }
  };

  // Valores del contexto
  const contextValue: AdminContextType = {
    cursos: state.cursos,
    curso: state.curso,
    maestros: state.maestros,
    estaCargando: state.estaCargando,
    obtenerCursos,
    obtenerCurso,
    obtenerMaestros,
    actualizarPension
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
    throw new Error(
      "useAdmin debe ser usado dentro de un AdminProvider",
    );
  }
  return context;
};