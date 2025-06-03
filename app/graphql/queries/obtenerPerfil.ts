import { gql } from "@apollo/client";

// Consulta para obtener el perfil del estudiante
export const OBTENER_PERFIL = gql`
  query ObtenerPerfil {
    obtenerPerfil {
      ... on Estudiante {
        id
        tipo_documento
        numero_identificacion
        fecha_nacimiento
        nombre_completo
        celular_padres
        grado {
          id
          nombre
        }
        pension_activa
      }
      ... on Maestro {
        id
        tipo_documento
        numero_identificacion
        nombre_completo
        email
        celular
      }
    }
  }
`;
