"use client";
import { createContext, useReducer, useContext, useEffect, useMemo } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { OBTENER_TAREAS_ESTUDIANTE } from "@/app/graphql/queries/obtenerTareasEstudiante";
import { toast, ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import { OBTENER_PERFIL } from "../graphql/queries/obtenerPerfil";
import { OBTENER_PERFIL_USUARIO } from "../graphql/queries/obtenerPerfilUsuario";
import { useRouter } from "next/navigation";

// 🔹 1. Definir el tipo de usuario
interface Usuario {
  id: number;
  nombre_completo: string;
  numero_identificacion: string;
  rol: "maestro" | "estudiante" | "admin";
  fecha_nacimiento?: Date | string;
  celular_padres?: string;
  token: string;
  grado_id?: string
  grado_nombre?: string
  tipo_documento?: string;
  email?: string;
  celular?: string;
  activo?: boolean;
  ultimo_login?: string;
  createdAt?: string;
  updatedAt?: string;
  pension_activa?: boolean
}

// Interfaces para tareas
interface Area {
  id: string;
  nombre: string;
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
  area: Area;
}

// 🔹 2. Estado inicial del AuthContext con funcionalidad de permisos
interface AuthState {
  usuario: Usuario | null;
  login: (usuario: Usuario) => void;
  logout: () => void;
  actualizarUsuario: (datosActualizados: Partial<Usuario>) => void;
  pensionActiva: boolean;
  puedeRealizarOperaciones: boolean; // Nueva propiedad que indica si el usuario puede realizar operaciones
  estaCargando: boolean; // Estado de carga
  error: string | null; // Error general
}

const initialState: AuthState = {
  usuario: null,
  pensionActiva: true,
  puedeRealizarOperaciones: true,
  estaCargando: true,
  error: null,
  login: () => { },
  logout: () => { },
  actualizarUsuario: () => { },
};

// 🔹 3. Crear el contexto
const AuthContext = createContext<AuthState>(initialState);

// Tipos para las acciones del reducer
type AuthAction =
  | { type: "LOGIN"; payload: Usuario }
  | { type: "LOGOUT" }
  | { type: "ACTUALIZAR_USUARIO"; payload: Partial<Usuario> }
  | { type: "VERIFICAR_PENSION" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// 🔹 4. Reducer con mejor manejo de estados
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
      localStorage.setItem("usuario", JSON.stringify(action.payload));

      // Verificar el estado de la pensión inmediatamente después del login
      const pensionEstadoLogin = action.payload.rol === "estudiante"
        ? action.payload.pension_activa !== false
        : true;

      return {
        ...state,
        usuario: action.payload,
        pensionActiva: pensionEstadoLogin,
        puedeRealizarOperaciones: action.payload.rol !== "estudiante" || pensionEstadoLogin,
        estaCargando: false,
        error: null
      };

    case "LOGOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      return {
        ...state,
        usuario: null,
        pensionActiva: true,
        puedeRealizarOperaciones: true,
        estaCargando: false,
        error: null
      };

    case "ACTUALIZAR_USUARIO":
      const usuarioActualizado = { ...state.usuario, ...action.payload } as Usuario;
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));

      // Verificar el estado de la pensión después de actualizar
      const pensionEstadoActualizado = usuarioActualizado.rol === "estudiante"
        ? usuarioActualizado.pension_activa !== false
        : true;

      return {
        ...state,
        usuario: usuarioActualizado,
        pensionActiva: pensionEstadoActualizado,
        puedeRealizarOperaciones: usuarioActualizado.rol !== "estudiante" || pensionEstadoActualizado,
        error: null
      };

    case "VERIFICAR_PENSION":
      const pensionEstado = state.usuario?.rol === "estudiante"
        ? state.usuario?.pension_activa !== false
        : true;

      return {
        ...state,
        pensionActiva: pensionEstado,
        puedeRealizarOperaciones: state.usuario?.rol !== "estudiante" || pensionEstado
      };

    case "SET_LOADING":
      return { ...state, estaCargando: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

/**
 * Obtiene la fecha actual en Bogotá (Colombia) en formato YYYY-MM-DD
 */
const getTodayInBogota = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha de un timestamp o fecha ISO en formato UTC y la ajusta
 */
const getDateFromInputFixed = (dateInput: string): Date => {
  let date: Date;

  // Si es un timestamp numérico (como string)
  if (/^\d+$/.test(dateInput)) {
    const timestamp = parseInt(dateInput, 10);
    date = new Date(timestamp);
    return new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ));
  }
  // Si es una fecha ISO
  else if (dateInput.includes('T') || dateInput.includes('+')) {
    date = new Date(dateInput);
    return new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ));
  }
  // Si es formato YYYY-MM-DD
  else if (dateInput.match(/^\d{4}-\d{2}-\d{2}/)) {
    const parts = dateInput.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(Date.UTC(year, month, day));
  }
  // Cualquier otro formato
  else {
    date = new Date(dateInput);
    return date;
  }
};

/**
 * Extrae la parte de fecha (YYYY-MM-DD) de un objeto Date usando UTC
 */
const formatToYYYYMMDD = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 🔹 5. Proveedor del contexto mejorado
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Verificar pensión cuando cambie el usuario
  useEffect(() => {
    if (state.usuario) {
      dispatch({ type: "VERIFICAR_PENSION" });
    }
  }, [state.usuario]);

  // Redirigir o mostrar error si la pensión no está activa
  useEffect(() => {
    const pathname = window.location.pathname;
    const rutasPermitidas = ["/ingreso", "/pension-inactiva"];

    if (
      state.usuario &&
      state.usuario.rol === "estudiante" &&
      !state.pensionActiva &&
      !rutasPermitidas.some(ruta => pathname.includes(ruta))

    ) {
      // Crear un error con más información
      const error = new Error("Pensión inactiva");

      // Lanzar el error para que lo maneje error.tsx
      throw error;
    }
    }, [state.pensionActiva, state.usuario, router]);

  // Recuperar datos del usuario desde localStorage al iniciar
  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const usuario = localStorage.getItem("usuario");
      if (usuario) {
        const parsedUser = JSON.parse(usuario) as Usuario;
        dispatch({ type: "LOGIN", payload: parsedUser });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("Error parsing usuario from localStorage:", error);
      dispatch({ type: "SET_ERROR", payload: "Error al cargar datos de usuario" });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Verificar si el usuario es un administrador
  const isAdmin = state.usuario?.rol === "admin";

  // Consulta para perfiles de estudiantes y maestros - Uso de useLazyQuery para controlar mejor cuándo se ejecuta
  const [obtenerPerfil, { data: perfilData }] = useLazyQuery(OBTENER_PERFIL, {
    fetchPolicy: "network-only",
    onError: (error) => {
      console.error("Error al obtener perfil:", error);
      dispatch({ type: "SET_ERROR", payload: "Error al cargar perfil" });
    }
  });

  // Consulta específica para administradores - Uso de useLazyQuery
  const [obtenerPerfilUsuario, { data: perfilUsuarioData }] = useLazyQuery(OBTENER_PERFIL_USUARIO, {
    fetchPolicy: "network-only",
    onError: (error) => {
      console.error("Error al obtener perfil admin:", error);
      dispatch({ type: "SET_ERROR", payload: "Error al cargar perfil de administrador" });
    }
  });

  // Ejecutar consultas apropiadas basadas en el rol del usuario y si tiene pensión activa
  useEffect(() => {
    if (state.usuario?.token) {
      if (isAdmin) {
        obtenerPerfilUsuario();
      } else {
        obtenerPerfil();
      }
    }
  }, [state.usuario?.token, isAdmin, obtenerPerfil, obtenerPerfilUsuario]);

  // Efecto para actualizar el estado con los datos del perfil
  useEffect(() => {
    if (perfilData?.obtenerPerfil) {
      const usuario = perfilData.obtenerPerfil;

      // Determinar el tipo basado en campos específicos
      if (usuario.grado) {
        // Es un Estudiante
        dispatch({
          type: "LOGIN",
          payload: {
            ...usuario,
            grado_id: usuario.grado.id,
            grado_nombre: usuario.grado.nombre,
            rol: "estudiante"
          }
        });
      } else {
        // Es un Maestro
        dispatch({
          type: "LOGIN",
          payload: {
            ...usuario,
            rol: "maestro"
          }
        });
      }
    }
  }, [perfilData]);

  // Efecto para actualizar el estado con los datos del perfil de administrador
  useEffect(() => {
    if (perfilUsuarioData?.obtenerPerfilUsuario) {
      const usuario = perfilUsuarioData.obtenerPerfilUsuario;

      // Asegurarse de que es un administrador
      if (usuario.rol === "admin") {
        dispatch({
          type: "LOGIN",
          payload: {
            ...usuario,
            rol: "admin"
          }
        });
      }
    }
  }, [perfilUsuarioData]);

  // Verificar si el usuario es un estudiante y si puede realizar operaciones
  const isEstudiante = state.usuario?.rol === "estudiante";
  const puedeConsultarTareas = useMemo(() =>
    isEstudiante && state.puedeRealizarOperaciones,
    [isEstudiante, state.puedeRealizarOperaciones]
  );

  // Consulta GraphQL para obtener tareas solo si el usuario es estudiante con pensión activa
  const { data: tareasData } = useQuery(OBTENER_TAREAS_ESTUDIANTE, {
    variables: {
      gradoId: isEstudiante ? state.usuario?.grado_id || "" : "",
      areaId: null // Para obtener todas las áreas
    },
    skip: !puedeConsultarTareas, // Solo ejecutar si puede realizar operaciones
    fetchPolicy: "network-only",
    onError: (error) => {
      console.error("Error al obtener tareas:", error);
      // No mostrar errores de consulta si la pensión no está activa
      if (state.pensionActiva) {
        dispatch({ type: "SET_ERROR", payload: "Error al cargar tareas" });
      }
    }
  });

  // Efecto para mostrar notificaciones de tareas pendientes solo para estudiantes con pensión activa
  useEffect(() => {
    // Solo proceder si el usuario puede realizar operaciones y tenemos datos de tareas
    if (!puedeConsultarTareas || !tareasData?.obtenerTareasEstudiante) return;

    const tareas = tareasData.obtenerTareasEstudiante as Tarea[];
    const hoyString = getTodayInBogota();
    const hoyDate = new Date(`${hoyString}T00:00:00`);

    // Filtrar tareas pendientes o por entregar próximamente
    const tareasPendientes = tareas.filter(tarea => {
      try {
        const fechaEntregaDate = getDateFromInputFixed(tarea.fechaEntrega);
        const fechaEntregaString = formatToYYYYMMDD(fechaEntregaDate);
        const fechaEntregaComparable = new Date(`${fechaEntregaString}T00:00:00`);
        const diferenciaMilisegundos = fechaEntregaComparable.getTime() - hoyDate.getTime();
        const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
        return diferenciaDias >= 0 && diferenciaDias <= 3 && tarea.estado !== "ENTREGADA";
      } catch (error) {
        console.error("Error al procesar fecha de tarea:", error);
        return false;
      }
    });

    // Mostrar notificaciones para tareas que vencen hoy
    const tareasHoy = tareasPendientes.filter(tarea => {
      try {
        const fechaEntregaDate = getDateFromInputFixed(tarea.fechaEntrega);
        const fechaEntregaString = formatToYYYYMMDD(fechaEntregaDate);
        return fechaEntregaString === hoyString;
      } catch (error) {
        return false;
      }
    });

    if (tareasHoy.length > 0) {
      toast.error(
        <div>
          <strong>¡Tienes {tareasHoy.length} {tareasHoy.length === 1 ? 'tarea' : 'tareas'} para entregar HOY!</strong>
          <ul className="mt-2 list-disc pl-4">
            {tareasHoy.map(tarea => (
              <li key={tarea.id}>
                {tarea.nombre} - {tarea.area.nombre}
              </li>
            ))}
          </ul>
        </div>,
        { autoClose: 12000, closeOnClick: false }
      );
    }

    // Mostrar notificaciones para tareas que vencen pronto (pero no hoy)
    const tareasProntoVencer = tareasPendientes.filter(tarea => {
      try {
        const fechaEntregaDate = getDateFromInputFixed(tarea.fechaEntrega);
        const fechaEntregaString = formatToYYYYMMDD(fechaEntregaDate);
        return fechaEntregaString > hoyString;
      } catch (error) {
        return false;
      }
    });

    if (tareasProntoVencer.length > 0) {
      // Agrupar tareas por días restantes
      const tareasPorDia: Record<string, Tarea[]> = {};

      tareasProntoVencer.forEach(tarea => {
        try {
          const fechaEntregaDate = getDateFromInputFixed(tarea.fechaEntrega);
          const fechaEntregaString = formatToYYYYMMDD(fechaEntregaDate);
          const fechaEntregaComparable = new Date(`${fechaEntregaString}T00:00:00`);
          const diferenciaDias = Math.floor(
            (fechaEntregaComparable.getTime() - hoyDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          const key = diferenciaDias.toString();
          if (!tareasPorDia[key]) {
            tareasPorDia[key] = [];
          }

          tareasPorDia[key].push(tarea);
        } catch (error) {
          console.error("Error al agrupar tarea:", error);
        }
      });

      // Mostrar notificación por cada grupo de días
      Object.keys(tareasPorDia).forEach(dias => {
        const tareas = tareasPorDia[dias];

        toast.info(
          <div>
            <strong>
              Tienes {tareas.length} {tareas.length === 1 ? 'tarea' : 'tareas'} para entregar en {dias} {dias === '1' ? 'día' : 'días'}
            </strong>
            <ul className="mt-2 list-disc pl-4">
              {tareas.map(tarea => (
                <li key={tarea.id}>
                  {tarea.nombre} - {tarea.area.nombre}
                </li>
              ))}
            </ul>
          </div>,
          { autoClose: 12000, closeOnClick: false }
        );
      });
    }
  }, [tareasData, puedeConsultarTareas]);

  // HOC para limitar operaciones GraphQL para estudiantes con pensión inactiva
  const withOperationRestriction = (WrappedComponent: React.ComponentType<any>) => {
    return (props: any) => {
      // Si el usuario no puede realizar operaciones, mostrar mensaje
      if (isEstudiante && !state.puedeRealizarOperaciones) {
        return (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
            <p className="text-amber-700">
              No puedes realizar esta operación debido a que tu pensión no está activa.
              Por favor, contacta con administración.
            </p>
            <button
              onClick={() => router.push('/contacto-administracion')}
              className="mt-2 bg-amber-100 hover:bg-amber-200 text-amber-800 py-1 px-3 rounded"
            >
              Contactar Administración
            </button>
          </div>
        );
      }

      // Si puede realizar operaciones, renderizar el componente normalmente
      return <WrappedComponent {...props} />;
    };
  };

  return (
    <>
      <AuthContext.Provider
        value={{
          usuario: state.usuario,
          login: (user) => dispatch({ type: "LOGIN", payload: user }),
          logout: () => dispatch({ type: "LOGOUT" }),
          actualizarUsuario: (datosActualizados) =>
            dispatch({ type: "ACTUALIZAR_USUARIO", payload: datosActualizados }),
          pensionActiva: state.pensionActiva,
          puedeRealizarOperaciones: state.puedeRealizarOperaciones,
          estaCargando: state.estaCargando,
          error: state.error,
        }}
      >
        {children}
      </AuthContext.Provider>
      <Toaster position="top-right" />

      <ToastContainer
        position="top-right"
        autoClose={12000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

// 🔹 6. Hooks mejorados para usar el contexto
export const useAuth = () => useContext(AuthContext);

// HOC para proteger componentes que requieren pensión activa
export const withPensionRestriction = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const { usuario, pensionActiva, estaCargando } = useAuth();
    const router = useRouter();

    // Si está cargando, mostrar indicador
    if (estaCargando) {
      return <div className="flex justify-center p-8">Cargando...</div>;
    }

    // Si es estudiante con pensión inactiva, redirigir
    if (usuario?.rol === 'estudiante' && !pensionActiva) {
      router.push('/pension-inactiva');
      return null;
    }

    // Si todo está bien, renderizar el componente
    return <Component {...props} />;
  };
};

// Hook para obtener queries GraphQL condicionadas a la pensión activa
export const useConditionedQuery = (query: any, options: any = {}) => {
  const { usuario, puedeRealizarOperaciones } = useAuth();

  // Si es estudiante, verificar que pueda realizar operaciones
  const shouldSkip = usuario?.rol === 'estudiante' && !puedeRealizarOperaciones;

  return useQuery(query, {
    ...options,
    skip: shouldSkip || options.skip,
  });
};