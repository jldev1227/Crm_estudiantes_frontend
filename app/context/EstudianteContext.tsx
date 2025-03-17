"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useQuery, useLazyQuery } from "@apollo/client";
import { OBTENER_AREAS_POR_GRADO } from "../graphql/queries/obtenerAreasPorGrado";
import { OBTENER_ACTIVIDADES_POR_AREA } from "../graphql/queries/obtenerActividadesPorArea";

// Definir los tipos
interface Area {
  id: string;
  nombre: string;
  maestro: {
    id: string,
    nombre_completo: string
  }
}

interface Actividad {
  id: string;
  nombre: string;
  fecha: string;
  descripcion: string;
  fotos: string[];
  area: Area;
}

interface EstudianteContextType {
  areas: Area[];
  actividades: Actividad[];
  cargandoAreas: boolean;
  cargandoActividades: boolean;
  errorAreas: any;
  errorActividades: any;
  obtenerActividades: (areaId: string) => void;
  obtenerActividadesPorFecha: (fecha: string) => void;
  filtrarActividades: (texto: string) => void;
  actividadesFiltradas: Actividad[];
}

// Crear el contexto
const EstudianteContext = createContext<EstudianteContextType | undefined>(
  undefined,
);

// Provider Component
export const EstudianteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { usuario } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadesFiltradas, setActividadesFiltradas] = useState<Actividad[]>(
    [],
  );

  // Query para obtener áreas por grado
  const {
    loading: cargandoAreas,
    error: errorAreas,
    data: dataAreas,
  } = useQuery(OBTENER_AREAS_POR_GRADO, {
    variables: { gradoId: usuario?.grado_id },
    skip: !usuario?.grado_id,
  });

  // Query para obtener actividades (se ejecutará bajo demanda)
  const [
    obtenerActividadesQuery,
    {
      loading: cargandoActividades,
      error: errorActividades,
      data: dataActividades,
    },
  ] = useLazyQuery(OBTENER_ACTIVIDADES_POR_AREA);

  // Actualizar áreas cuando se carguen los datos
  useEffect(() => {
    if (dataAreas && dataAreas.obtenerAreasPorGrado) {
      setAreas(dataAreas.obtenerAreasPorGrado);
    }
  }, [dataAreas]);

  // Actualizar actividades cuando se carguen los datos
  useEffect(() => {
    if (dataActividades && dataActividades.obtenerActividades) {
      const actividadesOrdenadas = [...dataActividades.obtenerActividades].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );
      setActividades(actividadesOrdenadas);
      setActividadesFiltradas(actividadesOrdenadas);
    }
  }, [dataActividades]);

  // Función para obtener actividades de un área específica
  const obtenerActividades = (areaId: string) => {
    obtenerActividadesQuery({
      variables: {
        gradoId: usuario?.grado_id,
        areaId: areaId,
      },
    });
  };

  // Función para obtener actividades por fecha
  const obtenerActividadesPorFecha = (fecha: string) => {
    // Convertir la fecha a formato ISO para comparación
    const fechaISO = new Date(fecha).toISOString().split("T")[0];

    // Filtrar actividades por fecha
    const filtradas = actividades.filter((actividad) => {
      const actividadFecha = new Date(actividad.fecha)
        .toISOString()
        .split("T")[0];
      return actividadFecha === fechaISO;
    });

    setActividadesFiltradas(filtradas);
  };

  // Función para filtrar actividades por texto
  const filtrarActividades = (texto: string) => {
    if (!texto.trim()) {
      setActividadesFiltradas(actividades);
      return;
    }

    const textoBusqueda = texto.toLowerCase();
    const filtradas = actividades.filter(
      (actividad) =>
        actividad.nombre.toLowerCase().includes(textoBusqueda) ||
        actividad.descripcion.toLowerCase().includes(textoBusqueda),
    );

    setActividadesFiltradas(filtradas);
  };

  // Valores del contexto
  const contextValue: EstudianteContextType = {
    areas,
    actividades,
    cargandoAreas,
    cargandoActividades,
    errorAreas,
    errorActividades,
    obtenerActividades,
    obtenerActividadesPorFecha,
    filtrarActividades,
    actividadesFiltradas,
  };

  return (
    <EstudianteContext.Provider value={contextValue}>
      {children}
    </EstudianteContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useEstudiante = () => {
  const context = useContext(EstudianteContext);
  if (context === undefined) {
    throw new Error(
      "useEstudiante debe ser usado dentro de un EstudianteProvider",
    );
  }
  return context;
};
