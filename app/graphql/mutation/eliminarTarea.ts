// app/graphql/mutation/eliminarTarea.js
import { gql } from "@apollo/client";

export const ELIMINAR_TAREA = gql`
  mutation EliminarTarea($id: ID!) {
    eliminarTarea(id: $id)
  }
`;