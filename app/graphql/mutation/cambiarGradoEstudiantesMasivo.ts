import { gql } from "@apollo/client";

export const CAMBIAR_GRADO_ESTUDIANTES_MASIVO = gql`
  mutation CambiarGradoEstudiantesMasivo(
    $estudiante_ids: [ID!]!
    $grado_id: ID!
  ) {
    cambiarGradoEstudiantesMasivo(
      estudiante_ids: $estudiante_ids
      grado_id: $grado_id
    ) {
      exitosos {
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
      fallidos {
        estudiante_id
        nombre_completo
        error
      }
      total_procesados
      total_exitosos
      total_fallidos
    }
  }
`;
