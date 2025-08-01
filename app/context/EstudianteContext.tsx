"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { addToast } from "@heroui/toast";

import { OBTENER_AREAS_POR_GRADO } from "../graphql/queries/obtenerAreasPorGrado";
import { OBTENER_ACTIVIDADES_POR_AREA } from "../graphql/queries/obtenerActividadesPorArea";
import { OBTENER_CALIFICACIONES_ESTUDIANTE } from "../graphql/queries/obtenerCalificacionesEstudiante";

import { useAuth } from "./AuthContext";

import socketService from "@/services/socketService";
import { Calificacion } from "@/types";

// Definir los tipos
interface Area {
  id: string;
  nombre: string;
  maestro: {
    id: string;
    nombre_completo: string;
  };
}

interface Actividad {
  id: string;
  nombre: string;
  fecha: string;
  descripcion: string;
  fotos: string[];
  area: Area;
}

interface SocketEventLog {
  eventName: string;
  data: any;
  timestamp: Date;
}

interface EstudianteErrorEvent {
  error: string;
  id: string;
}

interface EstudiantePensionActualizadaResponse {
  estado_pension: boolean;
}

interface EstudianteVerCalificacionesActualizadaResponse {
  estado_ver_calificaciones: boolean;
}

interface EstudianteContextType {
  areas: Area[];
  actividades: Actividad[];
  calificaciones: any[];
  cargandoAreas: boolean;
  cargandoActividades: boolean;
  cargandoCalificaciones: boolean;
  errorAreas: any;
  errorActividades: any;
  erroCalificaciones: any;
  obtenerActividades: (areaId: string) => void;
  obtenerCalificaciones: (
    area_id: string,
    periodo: number,
  ) => Promise<Calificacion[] | null>;
  obtenerActividadesPorFecha: (fecha: string) => void;
  filtrarActividades: (texto: string) => void;
  actividadesFiltradas: Actividad[];

  // Propiedades para Socket.IO
  socketConnected: boolean;
  socketEventLogs: SocketEventLog[];
  clearSocketEventLogs: () => void;
  connectSocket?: (usuarioId: string) => void;
  disconnectSocket?: () => void;
}

// Crear el contexto
const EstudianteContext = createContext<EstudianteContextType | undefined>(
  undefined,
);

// Provider Component
export const EstudianteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { usuario, actualizarPermisosCalificaciones } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [calificaciones, setCalificaciones] = useState<any[]>([]);
  const [actividadesFiltradas, setActividadesFiltradas] = useState<Actividad[]>(
    [],
  );

  // Estado para Socket.IO
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [socketEventLogs, setSocketEventLogs] = useState<SocketEventLog[]>([]);

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
    obtenerCalificacionesQuery,
    {
      loading: cargandoCalificaciones,
      error: erroCalificaciones,
      data: dataCalificaciones,
    },
  ] = useLazyQuery(OBTENER_CALIFICACIONES_ESTUDIANTE);

  // Query para obtener calificaciones
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

  // Actualizar calificaciones cuando se carguen los datos
  useEffect(() => {
    if (
      dataCalificaciones &&
      dataCalificaciones.obtenerCalificacionesEstudiante
    ) {
      setCalificaciones(
        dataCalificaciones.obtenerCalificacionesEstudiante.calificaciones,
      );
    }
  }, [dataCalificaciones]);

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

  // Función para obtener actividades de un área específica
  // ✅ VERSIÓN CORREGIDA - OPCIÓN 1 (Async/Await):
  const obtenerCalificaciones = async (
    area_id: string,
    periodo: number,
  ): Promise<Calificacion[] | null> => {
    try {
      if (!usuario?.id || !usuario?.grado_id) {
        console.warn("Faltan datos del usuario para obtener calificaciones");

        return null;
      }

      const { data } = await obtenerCalificacionesQuery({
        variables: {
          estudiante_id: usuario.id,
          grado_id: usuario.grado_id,
          area_id: area_id,
          periodo: periodo,
        },
      });

      console.log(data);

      return data?.obtenerCalificacionesEstudiante.calificaciones || null;
    } catch (error) {
      console.error("Error obteniendo calificaciones:", error);
      throw error;
    }
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

  // Inicializar Socket.IO cuando el usuario esté autenticado
  useEffect(() => {
    if (usuario?.id) {
      // Conectar socket
      socketService.connect(usuario.id.toString());

      // Verificar conexión inicial y configurar manejo de eventos de conexión
      const checkConnection = () => {
        const isConnected = socketService.isConnected();

        setSocketConnected(isConnected);
      };

      // Verificar estado inicial
      checkConnection();

      // Manejar eventos de conexión
      const handleConnect = () => {
        setSocketConnected(true);
      };

      const handleDisconnect = () => {
        setSocketConnected(false);
        addToast({
          title: "Error",
          description: "Desconectado de actualizaciones en tiempo real",
          color: "danger",
        });
      };

      // Manejadores para eventos de servicios
      const handlePensionActualizada = (
        data: EstudiantePensionActualizadaResponse,
      ) => {
        setSocketEventLogs((prev) => [
          ...prev,
          {
            eventName: "estudiante:pension-actualizada",
            data,
            timestamp: new Date(),
          },
        ]);

        if (data.estado_pension) {
          addToast({
            title: "Acceso habilitado",
            description:
              "Ya puedes acceder a la plataforma. Tu pensión ha sido renovada.",
            color: "success",
          });
        } else {
          addToast({
            title: "Se ha deshabilitado tu acceso por falta de pago",
            description: `Seras suspendido hasta que se realice renovación de tu pensión`,
            color: "warning",
          });
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        }
      };
      const handleVerCalificacionesActualizada = (
        data: EstudianteVerCalificacionesActualizadaResponse,
      ) => {
        setSocketEventLogs((prev) => [
          ...prev,
          {
            eventName: "estudiante:ver-calificaciones-actualizada",
            data,
            timestamp: new Date(),
          },
        ]);

        if (data.estado_ver_calificaciones) {
          addToast({
            title: "Acceso habilitado",
            description:
              "Ya puedes acceder a las calificaciones. Tu acceso ha sido autorizado.",
            color: "success",
          });
          actualizarPermisosCalificaciones(data.estado_ver_calificaciones);
        } else {
          actualizarPermisosCalificaciones(data.estado_ver_calificaciones);
          addToast({
            title: "Se ha deshabilitado tu acceso a las calificaciones",
            description: `Cualquier duda contactar al area administrativa`,
            color: "warning",
          });
        }
      };

      const handleEstudianteError = (data: EstudianteErrorEvent) => {
        // Verificar si el error corresponde al Estudiante actual
        if (data.id) {
          addToast({
            title: "Error con el Estudiante",
            description: data.error,
            color: "danger",
          });
        }
      };

      // Registrar manejadores de eventos de conexión
      socketService.on("connect", handleConnect);
      socketService.on("disconnect", handleDisconnect);

      // Registrar manejadores de eventos de estudiante
      socketService.on(
        "estudiante:pension-actualizada",
        handlePensionActualizada,
      );
      socketService.on(
        "estudiante:ver-calificaciones-actualizada",
        handleVerCalificacionesActualizada,
      );

      socketService.on("estudiante:error", handleEstudianteError);

      return () => {
        // Limpiar al desmontar
        socketService.off("connect");
        socketService.off("disconnect");

        // Limpiar manejadores de eventos de servicios
        socketService.off("estudiante:pension-actualizada");
        socketService.off("estudiante:ver-calificaciones-actualizada");
      };
    }
  }, [usuario?.id]);

  // Función para limpiar el registro de eventos de socket
  const clearSocketEventLogs = useCallback(() => {
    setSocketEventLogs([]);
  }, []);

  // Valores del contexto
  const contextValue: EstudianteContextType = {
    areas,
    actividades,
    calificaciones,
    cargandoAreas,
    cargandoActividades,
    cargandoCalificaciones,
    errorAreas,
    errorActividades,
    erroCalificaciones,
    obtenerActividades,
    obtenerCalificaciones,
    obtenerActividadesPorFecha,
    filtrarActividades,
    actividadesFiltradas,

    socketConnected,
    socketEventLogs,
    clearSocketEventLogs,
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
