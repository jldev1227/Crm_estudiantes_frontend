import { gql } from "@apollo/client";

export const CREAR_TAREA = gql`
  mutation CrearTarea($input: TareaInput!) {
    crearTarea(input: $input) {
      id
      nombre
      fechaEntrega
      fecha
      descripcion
      estado
      fotos
      pdfs
      grado_id
      area_id
      creador_id
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
      createdAt
      updatedAt
    }
  }
`;
