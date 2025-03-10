// En tu archivo de mutaciones
import { gql } from "@apollo/client";

export const ELIMINAR_ACTIVIDAD = gql`
  mutation EliminarActividad($id: ID!) {
    eliminarActividad(id: $id) {
      mensaje
    }
  }
`;
