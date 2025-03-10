import { gql } from "@apollo/client";

// Consulta para obtener áreas por grado
export const OBTENER_AREAS_POR_GRADO = gql`
  query ObtenerAreasPorGrado($gradoId: ID) {
    obtenerAreasPorGrado(grado_id: $gradoId) {
      id
      nombre
    }
  }
`;
