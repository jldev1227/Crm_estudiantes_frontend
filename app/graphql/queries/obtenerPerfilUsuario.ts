import { gql } from "@apollo/client";

export const OBTENER_PERFIL_USUARIO = gql`
  query ObtenerPerfilUsuario {
    obtenerPerfilUsuario {
      id
      nombre_completo
      email
      rol
      activo
      ultimo_login
      createdAt
      updatedAt
    }
  }
`;