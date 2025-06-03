// app/graphql/mutation/actualizarActividad.ts
import { gql } from "@apollo/client";

export const ACTUALIZAR_CONTACTO_MAESTRO = gql`
  mutation ActualizarContactoMaestro(
    $id: ID!
    $input: ActualizarContactoInput!
  ) {
    actualizarContactoMaestro(id: $id, input: $input) {
      success
      mensaje
      maestro {
        id
        nombre_completo
        celular
        email
      }
    }
  }
`;
