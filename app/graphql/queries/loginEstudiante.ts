// loginEstudiante.ts
import { gql } from "@apollo/client";

export const LOGIN_ESTUDIANTE = gql`
  mutation LoginEstudiante($numero_identificacion: String!, $password: String!) {
    loginEstudiante(numero_identificacion: $numero_identificacion, password: $password) {
      token
      estudiante {
        id
        nombre_completo
      }
    }
  }
`;
