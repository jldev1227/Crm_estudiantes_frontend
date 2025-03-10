import { gql } from "@apollo/client";

export const OBTENER_ACTIVIDADES = gql`
  query ObtenerActividades($grado_id: ID!, $area_id: ID!) {
    obtenerActividades(grado_id: $grado_id, area_id: $area_id) {
      id
      nombre
      fecha
      descripcion
      fotos
    }
  }
`;
