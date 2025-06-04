// loginEstudiante.ts
import { gql } from "@apollo/client";

export const OBTENER_CURSOS_MAESTRO = gql`
  query ObtenerAsignacionesMaestro {
    obtenerAsignacionesMaestro {
      grado {
        id
        nombre
        director {
          id
          nombre_completo
        }
      }
      area {
        id
        nombre
      }
    }
  }
`;
