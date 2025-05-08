import { gql } from "@apollo/client";

export const OBTENER_CURSO_GENERAL = gql`
  query ObtenerCursoGeneral($id: ID!) {
    obtenerCursoGeneral(id: $id) {
      id
      nombre
      estudiantes {
        id
        tipo_documento
        numero_identificacion
        fecha_nacimiento
        nombre_completo
        celular_padres
        grado_id
        pension_activa
      }
    }
  }
`;
