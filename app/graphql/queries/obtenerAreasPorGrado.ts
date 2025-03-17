import { gql } from "@apollo/client";

// Consulta simplificada que solo trae nombre de área y maestro
export const OBTENER_AREAS_POR_GRADO = gql`
  query ObtenerAreasPorGrado($gradoId: ID) {
    obtenerAreasPorGrado(grado_id: $gradoId) {
      id
      nombre
      maestro {
        id
        nombre_completo
      }
    }
  }
`;