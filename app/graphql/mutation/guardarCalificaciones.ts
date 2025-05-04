import { gql } from '@apollo/client';

export const GUARDAR_CALIFICACIONES = gql`
  mutation GuardarCalificaciones($input: CalificacionesInput!) {
    guardarCalificaciones(input: $input) {
      success
      mensaje
    }
  }
`;