"use client";
import {
  createContext,
  useReducer,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { toast, ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";

import { OBTENER_PERFIL } from "../graphql/queries/obtenerPerfil";
import { OBTENER_PERFIL_USUARIO } from "../graphql/queries/obtenerPerfilUsuario";

import { OBTENER_TAREAS_ESTUDIANTE } from "@/app/graphql/queries/obtenerTareasEstudiante";

// 🔹 Tipos e Interfaces
interface Usuario {
  id: number;
  nombre_completo: string;
  numero_identificacion: string;
  rol: "maestro" | "estudiante" | "admin";
  fecha_nacimiento?: Date | string;
  celular_padres?: string;
  token: string;
  grado_id?: string;
  grado_nombre?: string;
  tipo_documento?: string;
  email?: string;
  celular?: string;
  activo?: boolean;
  ultimo_login?: string;
  createdAt?: string;
  updatedAt?: string;
  pension_activa?: boolean;
  ver_calificaciones?: boolean;
}

interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  fechaEntrega: string;
  estado: string;
  fotos: string[];
  pdfs: string[];
  area: { id: string; nombre: string };
}

interface AuthState {
  usuario: Usuario | null;
  estaCargando: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (usuario: Usuario) => void;
  logout: () => void;
  actualizarUsuario: (datos: Partial<Usuario>) => void;
  actualizarPermisosCalificaciones: (estado: boolean) => void;
  pensionActiva: boolean;
  puedeRealizarOperaciones: boolean;
}

// 🔹 Estados y Acciones
const initialState: AuthState = {
  usuario: null,
  estaCargando: true,
  error: null,
};

type AuthAction =
  | { type: "LOGIN"; payload: Usuario }
  | { type: "LOGOUT" }
  | { type: "ACTUALIZAR_USUARIO"; payload: Partial<Usuario> }
  | { type: "ACTUALIZAR_VER_CALIFICACIONES"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// 🔹 Reducer simplificado (solo guarda token, no usuario completo)
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      // Solo guardar token en localStorage, no el usuario completo
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
        // Guardar rol temporalmente para la próxima carga (solo para saber qué query ejecutar)
        localStorage.setItem(
          "usuario",
          JSON.stringify({ rol: action.payload.rol }),
        );
      }

      return {
        ...state,
        usuario: action.payload,
        estaCargando: false,
        error: null,
      };

    case "LOGOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      return {
        ...state,
        usuario: null,
        estaCargando: false,
        error: null,
      };

    case "ACTUALIZAR_USUARIO":
      const usuarioActualizado = {
        ...state.usuario,
        ...action.payload,
      } as Usuario;

      // Solo actualizar rol en localStorage si es necesario
      if (action.payload.rol) {
        localStorage.setItem(
          "usuario",
          JSON.stringify({ rol: action.payload.rol }),
        );
      }

      return {
        ...state,
        usuario: usuarioActualizado,
        error: null,
      };

    case "ACTUALIZAR_VER_CALIFICACIONES":
      const usuarioConCalificaciones = {
        ...state.usuario,
        ver_calificaciones: action.payload,
      } as Usuario;

      return {
        ...state,
        usuario: usuarioConCalificaciones,
      };

    case "SET_LOADING":
      return { ...state, estaCargando: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

// 🔹 Utilidades de fecha simplificadas
const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

const parseDate = (dateInput: string): Date => {
  // Manejar timestamp numérico
  if (/^\d+$/.test(dateInput)) {
    return new Date(parseInt(dateInput, 10));
  }

  // Formato estándar
  return new Date(dateInput);
};

const getDaysDifference = (futureDate: string, currentDate: string): number => {
  const future = new Date(futureDate);
  const current = new Date(currentDate);
  const diffTime = future.getTime() - current.getTime();

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 🔹 Contexto
const AuthContext = createContext<AuthContextType | null>(null);

// 🔹 Provider Principal
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 🔹 Valores computados
  const pensionActiva = useMemo(() => {
    if (!state.usuario || state.usuario.rol !== "estudiante") return true;

    return state.usuario.pension_activa !== false;
  }, [state.usuario]);

  const puedeRealizarOperaciones = useMemo(() => {
    if (!state.usuario || state.usuario.rol !== "estudiante") return true;

    return pensionActiva;
  }, [state.usuario, pensionActiva]);

  const isEstudiante = state.usuario?.rol === "estudiante";

  // 🔹 Inicialización solo con token (datos frescos del servidor)
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          // Solo verificamos que hay token, los datos se obtienen del servidor
          dispatch({ type: "SET_LOADING", payload: true });
          // El useEffect de consultas GraphQL se encargará de obtener los datos
        } else {
          // No hay token, no hay usuario autenticado
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Error al verificar token:", error);
        dispatch({
          type: "SET_ERROR",
          payload: "Error al verificar autenticación",
        });
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  // 🔹 Verificación de pensión para estudiantes
  useEffect(() => {
    const pathname = window.location.pathname;
    const rutasPermitidas = ["/ingreso", "/pension-inactiva"];

    if (
      isEstudiante &&
      !pensionActiva &&
      !rutasPermitidas.some((ruta) => pathname.includes(ruta))
    ) {
      const error = new Error("Pensión inactiva");

      throw error;
    }
  }, [pensionActiva, isEstudiante]);

  // 🔹 Consultas GraphQL con lazy loading
  const [obtenerPerfil] = useLazyQuery(OBTENER_PERFIL, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.obtenerPerfil) {
        const usuario = data.obtenerPerfil;
        const updatedUser = usuario.grado
          ? {
              ...usuario,
              grado_id: usuario.grado.id,
              grado_nombre: usuario.grado.nombre,
              rol: "estudiante",
            }
          : { ...usuario, rol: "maestro" };

        dispatch({ type: "LOGIN", payload: updatedUser });
      }
    },
    onError: (error) => {
      console.error("Error al obtener perfil:", error);
      dispatch({ type: "SET_ERROR", payload: "Error al cargar perfil" });
    },
  });

  const [obtenerPerfilUsuario] = useLazyQuery(OBTENER_PERFIL_USUARIO, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.obtenerPerfilUsuario?.rol === "admin") {
        dispatch({
          type: "LOGIN",
          payload: { ...data.obtenerPerfilUsuario, rol: "admin" },
        });
      }
    },
    onError: (error) => {
      console.error("Error al obtener perfil admin:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Error al cargar perfil de administrador",
      });
    },
  });

  // 🔹 Ejecutar consultas automáticamente si hay token
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Obtener datos frescos del servidor basado en el token
      const savedUser = localStorage.getItem("usuario");
      const isAdminFromStorage = savedUser
        ? JSON.parse(savedUser).rol === "admin"
        : false;

      if (isAdminFromStorage) {
        obtenerPerfilUsuario();
      } else {
        obtenerPerfil();
      }
    }
  }, []); // Solo al montar el componente

  // 🔹 Consulta de tareas para estudiantes
  const { data: tareasData } = useQuery(OBTENER_TAREAS_ESTUDIANTE, {
    variables: {
      gradoId: state.usuario?.grado_id || "",
      areaId: null,
    },
    skip: !isEstudiante || !puedeRealizarOperaciones,
    fetchPolicy: "network-only",
    onError: (error) => {
      if (pensionActiva) {
        console.error("Error al obtener tareas:", error);
        dispatch({ type: "SET_ERROR", payload: "Error al cargar tareas" });
      }
    },
  });

  // 🔹 Notificaciones de tareas
  useEffect(() => {
    if (
      !isEstudiante ||
      !puedeRealizarOperaciones ||
      !tareasData?.obtenerTareasEstudiante
    ) {
      return;
    }

    const tareas = tareasData.obtenerTareasEstudiante as Tarea[];
    const hoy = getTodayString();

    // Filtrar tareas pendientes por días
    const tareasPorDias: Record<number, Tarea[]> = {};

    tareas
      .filter((tarea) => tarea.estado !== "ENTREGADA")
      .forEach((tarea) => {
        try {
          const fechaEntrega = parseDate(tarea.fechaEntrega)
            .toISOString()
            .split("T")[0];
          const dias = getDaysDifference(fechaEntrega, hoy);

          if (dias >= 0 && dias <= 3) {
            if (!tareasPorDias[dias]) tareasPorDias[dias] = [];
            tareasPorDias[dias].push(tarea);
          }
        } catch (error) {
          console.error("Error al procesar fecha de tarea:", error);
        }
      });

    // Mostrar notificaciones
    Object.entries(tareasPorDias).forEach(([dias, tareas]) => {
      const numDias = parseInt(dias);
      const esHoy = numDias === 0;
      const mensaje = esHoy
        ? `¡Tienes ${tareas.length} tarea${tareas.length > 1 ? "s" : ""} para entregar HOY!`
        : `Tienes ${tareas.length} tarea${tareas.length > 1 ? "s" : ""} para entregar en ${numDias} día${numDias > 1 ? "s" : ""}`;

      const toastType = esHoy ? toast.error : toast.info;

      toastType(
        <div>
          <strong>{mensaje}</strong>
          <ul className="mt-2 list-disc pl-4">
            {tareas.map((tarea) => (
              <li key={tarea.id}>
                {tarea.nombre} - {tarea.area.nombre}
              </li>
            ))}
          </ul>
        </div>,
        { autoClose: 12000, closeOnClick: false },
      );
    });
  }, [tareasData, isEstudiante, puedeRealizarOperaciones]);

  // 🔹 Funciones del contexto
  const contextValue: AuthContextType = {
    ...state,
    pensionActiva,
    puedeRealizarOperaciones,
    login: (user) => dispatch({ type: "LOGIN", payload: user }),
    logout: () => dispatch({ type: "LOGOUT" }),
    actualizarUsuario: (datos) =>
      dispatch({ type: "ACTUALIZAR_USUARIO", payload: datos }),
    actualizarPermisosCalificaciones: (estado: boolean) =>
      dispatch({ type: "ACTUALIZAR_VER_CALIFICACIONES", payload: estado }),
  };

  return (
    <>
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
      <Toaster position="top-right" />
      <ToastContainer
        closeOnClick
        draggable
        newestOnTop
        pauseOnFocusLoss
        pauseOnHover
        autoClose={12000}
        hideProgressBar={false}
        position="top-right"
        rtl={false}
        theme="colored"
      />
    </>
  );
}

// 🔹 Hooks y HOCs
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
};

export const useConditionedQuery = (query: any, options: any = {}) => {
  const { usuario, puedeRealizarOperaciones } = useAuth();
  const shouldSkip = usuario?.rol === "estudiante" && !puedeRealizarOperaciones;

  return useQuery(query, {
    ...options,
    skip: shouldSkip || options.skip,
  });
};
