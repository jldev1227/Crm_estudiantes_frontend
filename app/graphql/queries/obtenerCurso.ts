import { gql } from "@apollo/client";

export const OBTENER_CURSO = gql`
  query ObtenerCurso($id: ID!, $area_id: ID!) {
    obtenerCurso(id: $id, area_id: $area_id) {
      id
      nombre
      estudiantes {
        id
        tipo_documento
        numero_identificacion
        fecha_nacimiento
        nombre_completo
        celular_padres
        password
        grado_id
      }
      area {
        id
        nombre
      }
    }
  }
`;
