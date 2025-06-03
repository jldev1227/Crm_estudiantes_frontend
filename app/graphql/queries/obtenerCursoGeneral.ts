import { gql } from "@apollo/client";

export const OBTENER_CURSO_GENERAL = gql`
  query ObtenerCursoConAreas($id: ID!) {
    obtenerCursoGeneral(id: $id) {
      id
      nombre
      director {
        id
        nombre_completo
        email
      }
      estudiantes {
        id
        nombre_completo
        numero_identificacion
        celular_padres
        fecha_nacimiento
        tipo_documento
        pension_activa
      }
      areas {
        id
        nombre
        maestro {
          id
          nombre_completo
          email
        }
        asignacion_id
      }
    }
  }
`;
