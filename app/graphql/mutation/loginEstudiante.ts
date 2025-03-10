// graphql.js - Archivo para almacenar todas tus consultas GraphQL del cliente

import { gql } from "@apollo/client";

// Consulta para iniciar sesión como estudiante
export const LOGIN_ESTUDIANTE = gql`
  mutation LoginEstudiante($numero_identificacion: String!, $password: String!) {
    loginEstudiante(numero_identificacion: $numero_identificacion, password: $password) {
      token
      estudiante {
        id
        tipo_documento
        numero_identificacion
        fecha_nacimiento
        nombre_completo
        celular_padres
        grado_id
      }
    }
  }
`;