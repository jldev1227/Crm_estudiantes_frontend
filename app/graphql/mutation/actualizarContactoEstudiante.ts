import { gql } from "@apollo/client";

export const ACTUALIZAR_CONTACTO_ESTUDIANTE = gql`
  mutation ActualizarContactoEstudiante(
    $id: ID!
    $input: ActualizarContactoEstudianteInput!
  ) {
    actualizarContactoEstudiante(id: $id, input: $input) {
      success
      mensaje
      estudiante {
        id
        tipo_documento
        celular_padres
        nombre_completo
      }
    }
  }
`;
