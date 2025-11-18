import { gql } from "@apollo/client";

export const OBTENER_CALIFICACIONES_GRADO_COMPLETO = gql`
  query ObtenerCalificacionesGradoCompleto($grado_id: ID!, $periodo: Int!) {
    obtenerCalificacionesGradoCompleto(grado_id: $grado_id, periodo: $periodo) {
      grado {
        id
        nombre
      }
      calificaciones {
        area {
          id
          nombre
        }
        notaFinal
        estudiante {
          id
          tipo_documento
          nombre_completo
          numero_identificacion
        }
      }
    }
  }
`;
