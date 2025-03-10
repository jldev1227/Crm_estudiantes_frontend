'use client';
import { createContext, useReducer, useContext, useEffect } from "react";

// 🔹 1. Definir el tipo de usuario
interface Usuario {
    id: string;
    nombre: string;
    numero_identificacion: string;
    rol: "maestro" | "estudiante";
    fecha_nacimiento?: string;
    celular_padres?: string;
    token: string;
    grado_id?: string;
}

// 🔹 2. Estado inicial del AuthContext
const initialState = {
    usuario: null as Usuario | null,
    login: (usuario: Usuario) => {},
    logout: () => {}
};

// 🔹 3. Crear el contexto
const AuthContext = createContext(initialState);

// 🔹 4. Reducer para manejar el estado de autenticación
const authReducer = (state: any, action: any) => {
    switch (action.type) {
        case "LOGIN":
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("usuario", JSON.stringify(action.payload));
            return { usuario: action.payload };
        case "LOGOUT":
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            return { usuario: null };
        default:
            return state;
    }
};

// 🔹 5. Proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Cargar usuario desde localStorage al iniciar
    useEffect(() => {
        const storedUser = localStorage.getItem("usuario");
        if (storedUser) {
            dispatch({ type: "LOGIN", payload: JSON.parse(storedUser) });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ usuario: state.usuario, login: (user) => dispatch({ type: "LOGIN", payload: user }), logout: () => dispatch({ type: "LOGOUT" }) }}>
            {children}
        </AuthContext.Provider>
    );
}

// 🔹 6. Hook para usar el contexto en cualquier parte de la app
export const useAuth = () => useContext(AuthContext);
