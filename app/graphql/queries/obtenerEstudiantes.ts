import { gql } from "@apollo/client";

// Consulta para obtener estadisticas del administrador
export const OBTENER_ESTUDIANTES = gql`
  query ObtenerEstudiantes {
    obtenerEstudiantes {
      id
      nombre_completo
      grado {
        id
        nombre
      }
    }
  }
`;
