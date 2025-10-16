import { gql } from "@apollo/client";

export const CAMBIAR_GRADO_ESTUDIANTE = gql`
  mutation CambiarGradoEstudiante($id: ID!, $grado_id: ID!) {
    cambiarGradoEstudiante(id: $id, grado_id: $grado_id) {
      id
      tipo_documento
      numero_identificacion
      fecha_nacimiento
      nombre_completo
      celular_padres
      password
      grado_id
      pension_activa
      ver_calificaciones
      grado {
        id
        nombre
        director {
          id
          nombre_completo
        }
      }
    }
  }
`;