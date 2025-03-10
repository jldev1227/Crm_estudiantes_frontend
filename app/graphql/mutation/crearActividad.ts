import { gql } from '@apollo/client';

export const CREAR_ACTIVIDAD = gql`
  mutation CrearActividad($input: ActividadInput!) {
    crearActividad(input: $input) {
      id
      nombre
      fecha
      descripcion
      fotos
      grado {
        id
        nombre
      }
      area {
        id
        nombre
      }
    }
  }
`;