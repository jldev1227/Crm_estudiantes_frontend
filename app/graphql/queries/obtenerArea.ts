import { gql } from "@apollo/client";

export const OBTENER_AREA = gql`
 query ObtenerArea($id: ID!) {
  obtenerArea(id: $id) {
    id
    nombre
  }
}
`;
