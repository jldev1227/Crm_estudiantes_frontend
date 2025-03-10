// loginEstudiante.ts
import { gql } from "@apollo/client";

export const OBTENER_CURSOS_MAESTRO = gql`
  query ObtenerAsignacionesMaestro {
    obtenerAsignacionesMaestro {
      grado {
        id
        nombre
      }
      area {
        id
        nombre
      }
    }
  }
`;
