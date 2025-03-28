"use client";
import { createContext, useReducer, useContext, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { OBTENER_TAREAS_ESTUDIANTE } from "@/app/graphql/queries/obtenerTareasEstudiante";
import { toast, ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import { OBTENER_PERFIL } from "../graphql/queries/obtenerPerfil";

// 🔹 1. Definir el tipo de usuario
interface Usuario {
  id: string;
  nombre_completo: string;
  numero_identificacion: string;
  rol: "maestro" | "estudiante";
  fecha_nacimiento?: Date | string;
  celular_padres?: string;
  token: string;
  grado_id?: string
  grado_nombre?: string
  tipo_documento?: string;
  email?: string;
  celular?: string;
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
  fechaEntrega: string; // Timestamp o formato ISO
  estado: string;
  fotos: string[];
  pdfs: string[];
  area: Area;
}

// 🔹 2. Estado inicial del AuthContext
interface AuthState {
  usuario: Usuario | null;
  login: (usuario: Usuario) => void;
  logout: () => void;
  actualizarUsuario: (datosActualizados: Partial<Usuario>) => void;
}

const initialState: AuthState = {
  usuario: null,
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
  | { type: "ACTUALIZAR_USUARIO"; payload: Partial<Usuario> };

// 🔹 4. Reducer para manejar el estado de autenticación
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {

    case "LOGIN":
      if(action.payload.token){
        localStorage.setItem("token", action.payload.token);
      }
      localStorage.setItem("usuario", JSON.stringify(action.payload));
      return { ...state, usuario: action.payload };
    case "LOGOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      return { ...state, usuario: null };
    case "ACTUALIZAR_USUARIO":
      const usuarioActualizado = { ...state.usuario, ...action.payload } as Usuario;
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      return { ...state, usuario: usuarioActualizado };
    default:
      return state;
  }
};

/**
 * Obtiene la fecha actual en Bogotá (Colombia) en formato YYYY-MM-DD
 */
const getTodayInBogota = (): string => {
  // Crear objeto Date con la hora actual
  const now = new Date();

  // Formatear la fecha a YYYY-MM-DD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha de un timestamp o fecha ISO en formato UTC y la ajusta para que 
 * corresponda con la fecha almacenada en la base de datos
 */
const getDateFromInputFixed = (dateInput: string): Date => {
  let date: Date;

  // Si es un timestamp numérico (como string)
  if (/^\d+$/.test(dateInput)) {
    const timestamp = parseInt(dateInput, 10);
    date = new Date(timestamp);

    // Crear una nueva fecha usando los componentes UTC para preservar la fecha correcta
    return new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ));
  }
  // Si es una fecha ISO
  else if (dateInput.includes('T') || dateInput.includes('+')) {
    // Crear la fecha a partir de la cadena ISO
    date = new Date(dateInput);

    // Usar los componentes UTC para preservar la fecha
    return new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ));
  }
  // Si es formato YYYY-MM-DD
  else if (dateInput.match(/^\d{4}-\d{2}-\d{2}/)) {
    // Extraer componentes
    const parts = dateInput.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Meses en JS son 0-11
    const day = parseInt(parts[2], 10);

    // Crear fecha usando UTC
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
  // Usar componentes UTC para que coincida con la fecha de la base de datos
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 🔹 5. Proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);


  const { data } = useQuery(OBTENER_PERFIL, {
    fetchPolicy: "network-only"
  });

  useEffect(() => {
    if (data?.obtenerPerfil) {
      const usuario = data.obtenerPerfil;
      
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
  }, [data]);

  // Verificar si el usuario es un estudiante
  const isEstudiante = state.usuario?.rol === "estudiante";

  // Consulta GraphQL para obtener tareas solo si el usuario es estudiante
  const { data: tareasData } = useQuery(OBTENER_TAREAS_ESTUDIANTE, {
    variables: {
      gradoId: isEstudiante ? state.usuario?.grado_id || "" : "",
      areaId: null // Para obtener todas las áreas
    },
    skip: !isEstudiante, // Solo ejecutar si el usuario es estudiante
    fetchPolicy: "network-only"
  });

  // Efecto para mostrar notificaciones de tareas pendientes solo para estudiantes
  useEffect(() => {
    // Solo proceder si el usuario es estudiante y tenemos datos de tareas
    if (!isEstudiante || !tareasData?.obtenerTareasEstudiante) return;

    const tareas = tareasData.obtenerTareasEstudiante as Tarea[];

    // Obtener la fecha actual en Bogotá
    const hoyString = getTodayInBogota();

    // Convertir a objeto Date para comparaciones
    const hoyDate = new Date(`${hoyString}T00:00:00`);

    // Filtrar tareas pendientes o por entregar próximamente
    const tareasPendientes = tareas.filter(tarea => {
      try {
        // Obtener la fecha de entrega ajustada para que coincida con la BD
        const fechaEntregaDate = getDateFromInputFixed(tarea.fechaEntrega);

        // Extraer solo la parte de fecha para comparación
        const fechaEntregaString = formatToYYYYMMDD(fechaEntregaDate);

        // Para comparación, usar objetos Date normalizados a medianoche
        const fechaEntregaComparable = new Date(`${fechaEntregaString}T00:00:00`);

        // Calcular la diferencia de días
        const diferenciaMilisegundos = fechaEntregaComparable.getTime() - hoyDate.getTime();
        const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

        // Incluir tareas que vencen hoy o en los próximos 3 días y no estén entregadas
        return diferenciaDias >= 0 && tarea.estado !== "ENTREGADA";
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

          // Para comparación, usar objetos Date normalizados a medianoche
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
  }, [tareasData, isEstudiante]);


  return (
    <>
      <AuthContext.Provider
        value={{
          usuario: state.usuario,
          login: (user) => dispatch({ type: "LOGIN", payload: user }),
          logout: () => dispatch({ type: "LOGOUT" }),
          actualizarUsuario: (datosActualizados) =>
            dispatch({ type: "ACTUALIZAR_USUARIO", payload: datosActualizados }),
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
// 🔹 6. Hook para usar el contexto en cualquier parte de la app
export const useAuth = () => useContext(AuthContext);