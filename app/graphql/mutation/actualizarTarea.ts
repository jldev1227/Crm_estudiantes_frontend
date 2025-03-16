// app/graphql/mutation/actualizarTarea.js
import { gql } from "@apollo/client";

export const ACTUALIZAR_TAREA = gql`
  mutation ActualizarTarea($id: ID!, $input: TareaUpdateInput!) {
    actualizarTarea(id: $id, input: $input) {
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