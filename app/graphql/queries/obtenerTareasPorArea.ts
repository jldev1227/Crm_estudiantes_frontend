// app/graphql/queries/obtenerTareasPorGradoYArea.js
import { gql } from "@apollo/client";

export const OBTENER_TAREAS_POR_GRADO_Y_AREA = gql`
  query ObtenerTareasPorGradoYArea($grado_id: ID!, $area_id: ID!) {
    obtenerTareasPorGradoYArea(grado_id: $grado_id, area_id: $area_id) {
      id
      nombre
      fechaEntrega
      fecha
      descripcion
      estado
      fotos
      pdfs
      grado {
        id
        nombre
      }
      area {
        id
        nombre
      }
      creador {
        id
      }
      createdAt
    }
  }
`;