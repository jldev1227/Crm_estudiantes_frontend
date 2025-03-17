// loginEstudiante.ts
import { gql } from "@apollo/client";

export const OBTENER_ACTIVIDADES_POR_AREA = gql`
  query ObtenerActividadesPorArea($grado_id: ID!, $area_id: ID!) {
    obtenerActividadesPorArea(grado_id: $grado_id, area_id: $area_id) {
      id
      nombre
      fecha
      descripcion
      fotos
      pdfs
      createdAt
      updatedAt
      area {
        id
        nombre
      }
    }
  }
`;