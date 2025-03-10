// loginEstudiante.ts
import { gql } from "@apollo/client";

export const LOGIN_MAESTRO = gql`
  mutation LoginMaestro($numero_identificacion: String!, $password: String!) {
    loginMaestro(
      numero_identificacion: $numero_identificacion
      password: $password
    ) {
      token
      maestro {
        id
        nombre_completo
        celular
        email
        tipo_documento
        numero_identificacion
      }
    }
  }
`;
