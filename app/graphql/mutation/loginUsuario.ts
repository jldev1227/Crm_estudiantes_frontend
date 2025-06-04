import { gql } from "@apollo/client";

export const LOGIN_USUARIO = gql`
  mutation LoginUsuario($email: String!, $password: String!) {
    loginUsuario(email: $email, password: $password) {
      token
      usuario {
        id
        email
        rol
      }
    }
  }
`;
