import { gql } from "@apollo/client";

// Consulta para obtener actividades del estudiante
export const OBTENER_ACTIVIDADES_ESTUDIANTE = gql`
  query ObtenerActividadesEstudiante($areaId: ID) {
    obtenerActividadesEstudiante(area_id: $areaId) {
      id
      nombre
      fecha
      hora
      descripcion
      fotos
      pdfs
      area {
        id
        nombre
      }
    }
  }
`;
