// loginEstudiante.ts
import { gql } from "@apollo/client";

export const OBTENER_ACTIVIDADES_POR_AREA = gql`
  query ObtenerActividadesPorArea {
    obtenerActividadesPorArea {
      id
      nombre
      fecha
      descripcion
      fotos
      createdAt
      updatedAt
      area {
        id
        nombre
      }
    }
  }
`;
