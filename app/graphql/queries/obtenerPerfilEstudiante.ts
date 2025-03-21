import { gql } from "@apollo/client";

// Consulta para obtener el perfil del estudiante
export const OBTENER_PERFIL_ESTUDIANTE = gql`
  query ObtenerPerfilEstudiante {
    obtenerPerfilEstudiante {
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
    }
  }
`;
