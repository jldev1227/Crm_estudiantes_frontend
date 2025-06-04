import { gql } from "@apollo/client";

export const CREAR_ACTIVIDAD = gql`
  mutation CrearActividad($input: ActividadInput!) {
    crearActividad(input: $input) {
      id
      nombre
      fecha
      descripcion
      fotos
      hora
      pdfs
      createdAt
      updatedAt
      grado {
        id
        nombre
      }
      area {
        id
        nombre
      }
      creador {
        id
        nombre_completo
      }
    }
  }
`;
