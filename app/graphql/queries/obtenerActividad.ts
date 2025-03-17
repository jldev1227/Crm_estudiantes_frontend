// app/graphql/queries/obtenerActividad.ts
import { gql } from "@apollo/client";

export const OBTENER_ACTIVIDAD = gql`
  query ObtenerActividad($id: ID!) {
    obtenerActividad(id: $id) {
      id
      nombre
      fecha
      hora
      descripcion
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
    }
  }
`;
