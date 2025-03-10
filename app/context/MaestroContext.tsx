"use client";
import React, { createContext, useReducer, useContext } from "react";
import { useApolloClient } from "@apollo/client";
import { OBTENER_CURSOS_MAESTRO } from "../graphql/queries/obtenerCursosMaestro";

// Estado inicial
const initialState = {
  cursos: [],
  curso: null, // Para un curso específico
};

// Reducer
const maestroReducer = (state: any, action: any) => {
  switch (action.type) {
    case "OBTENER_CURSOS_MAESTRO":
      return {
        ...state,
        cursos: action.payload,
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

  return (
    <MaestroContext.Provider
      value={{
        cursos: state.cursos,
        curso: state.curso,
        obtenerCursosMaestro,
      }}
    >
      {children}
    </MaestroContext.Provider>
  );
}

// Hook para usar el contexto
export const useMaestro = () => useContext(MaestroContext);
