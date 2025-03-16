// app/graphql/mutation/actualizarActividad.ts
import { gql } from "@apollo/client";

export const ACTUALIZAR_ACTIVIDAD = gql`
  mutation ActualizarActividad($id: ID!, $input: ActividadUpdateInput!) {
    actualizarActividad(id: $id, input: $input) {
      id
      nombre
      fecha
      descripcion
      fotos
      hora
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
