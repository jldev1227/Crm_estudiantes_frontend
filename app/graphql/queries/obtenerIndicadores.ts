// ============ CON APOLLO CLIENT ============
import { gql } from "@apollo/client";

export const OBTENER_INDICADORES = gql`
  query ObtenerIndicadores($gradoId: Int!, $areaId: Int!, $periodo: Int!) {
    obtenerIndicadores(
      grado_id: $gradoId
      area_id: $areaId
      periodo: $periodo
    ) {
      success
      mensaje
      data {
        id
        nombre
        periodo
        grado_id
        area_id
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
  }
`;
