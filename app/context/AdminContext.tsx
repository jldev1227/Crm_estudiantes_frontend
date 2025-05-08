"use client";

import React, { createContext, useContext, useState, useEffect, useReducer } from "react";
import { useAuth } from "./AuthContext";
import { useApolloClient } from "@apollo/client";
import { OBTENER_CURSOS } from "../graphql/queries/obtenerCursos";
import { OBTENER_CURSO_GENERAL } from "../graphql/queries/obtenerCursoGeneral";
import { Curso } from "@/types";

interface AdminContextType {
  cursos: Curso[];
  curso: Curso | null;
  obtenerCursos: () => void
  obtenerCurso: (id: string) => void
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

  // Valores del contexto
  const contextValue: AdminContextType = {
    cursos: state.cursos,
    curso: state.curso,
    obtenerCursos,
    obtenerCurso,
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
