// obtenerTareasEstudiante.js
import { gql } from "@apollo/client";

export const OBTENER_TAREAS_ESTUDIANTE = gql`
  query ObtenerTareasEstudiante($gradoId: ID!, $areaId: ID) {
    obtenerTareasEstudiante(gradoId: $gradoId, areaId: $areaId) {
      id
      nombre
      descripcion
      fecha
      fechaEntrega
      estado
      fotos
      pdfs
      area {
        id
        nombre
      }
    }
  }
`;
