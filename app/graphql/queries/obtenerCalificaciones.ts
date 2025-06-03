// graphql/queries/obtenerCalificaciones.js
import { gql } from "@apollo/client";

export const OBTENER_CALIFICACIONES = gql`
  query ObtenerCalificaciones($grado_id: ID!, $area_id: ID!, $periodo: Int!) {
    obtenerCalificaciones(
      grado_id: $grado_id
      area_id: $area_id
      periodo: $periodo
    ) {
      id
      estudiante_id
      grado_id
      area_id
      periodo
      notaFinal
      createdAt
      updatedAt
      estudiante {
        id
        nombre_completo
        numero_identificacion
      }
      notas {
        id
        nombre
        valor
        porcentaje
        actividad_id
      }
    }
  }
`;
