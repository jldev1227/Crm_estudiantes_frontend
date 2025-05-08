"use client";

import React, { createContext, useContext, useState, useEffect, useReducer } from "react";
import { useAuth } from "./AuthContext";
import { useApolloClient } from "@apollo/client";
import { OBTENER_CURSOS } from "../graphql/queries/obtenerCursos";
import { OBTENER_CURSO_GENERAL } from "../graphql/queries/obtenerCursoGeneral";
import { Curso, Estudiante } from "@/types";
import { ACTUALIZAR_PENSION } from "../graphql/mutation/actualizarPension";

interface AdminContextType {
  cursos: Curso[];
  curso: Curso | null;
  obtenerCursos: () => void
  obtenerCurso: (id: string) => void
  actualizarPension: (id: string) => void
}

// Estado inicial
const initialState = {
  cursos: [],
  curso: null,
};

// Reducer
const adminReducer = (state: any, action: any) => {
  switch (action.type) {
    case "OBTENER_CURSOS":
      return {
        ...state,
        cursos: action.payload,
      };
    case "OBTENER_CURSO_GENERAL":
      return {
        ...state,
        curso: action.payload,
      };
      case "ACTUALIZAR_PENSION":
        if (!state.curso) return state;

        return {
          ...state,
          curso: {
            ...state.curso,
            estudiantes: state.curso.estudiantes.map((estudiante : Estudiante) => 
              estudiante.id === action.payload.id 
                ? { ...estudiante, pension_activa: !estudiante.pension_activa } 
                : estudiante
            )
          }
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
    try {
      const { data } = await client.query({
        query: OBTENER_CURSOS
      });

      console.log(data)

      dispatch({
        type: "OBTENER_CURSOS",
        payload: data.obtenerCursos,
      });
    } catch (error) {
      console.error("Error obteniendo cursos:", error);
    }
  };

  // Función que ejecuta la query y despacha la acción para guardar los cursos
  const obtenerCurso = async (id: string) => {
    try {
      const { data } = await client.query({
        query: OBTENER_CURSO_GENERAL,
        variables: { id }
      });

      console.log(data.obtenerCursoGeneral)

      dispatch({
        type: "OBTENER_CURSO_GENERAL",
        payload: data.obtenerCursoGeneral,
      });
    } catch (error) {
      console.error("Error obteniendo cursos:", error);
    }
  };

  // Función que ejecuta la mutation y despacha la acción para actualizar la pension del estudiante
  const actualizarPension = async (id: string) => {
    try {
      const { data } = await client.mutate({
        mutation: ACTUALIZAR_PENSION,
        variables: { id }
      });

      console.log(data.actualizarPension);

      dispatch({
        type: "ACTUALIZAR_PENSION",
        payload: { id: data.actualizarPension.id},
      });
    } catch (error) {
      console.error("Error actualizando pensión:", error);
    }
  };
  // Valores del contexto
  const contextValue: AdminContextType = {
    cursos: state.cursos,
    curso: state.curso,
    obtenerCursos,
    obtenerCurso,
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
