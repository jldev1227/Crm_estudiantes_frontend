// app/graphql/queries/obtenerTarea.js
import { gql } from "@apollo/client";

export const OBTENER_TAREA = gql`
  query ObtenerTarea($id: ID!) {
    obtenerTarea(id: $id) {
      id
      nombre
      fechaEntrega
      fecha
      descripcion
      estado
      fotos
      pdfs
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
      createdAt
      updatedAt
    }
  }
`;
