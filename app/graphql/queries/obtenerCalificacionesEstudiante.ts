// graphql/queries/obtenerCalificacionesEstudiante.js
import { gql } from '@apollo/client';

export const OBTENER_CALIFICACIONES_ESTUDIANTE = gql`
  query ObtenerCalificacionesEstudiante(
    $estudiante_id: ID!
    $grado_id: ID
    $area_id: ID
    $periodo: Int
  ) {
    obtenerCalificacionesEstudiante(
      estudiante_id: $estudiante_id
      grado_id: $grado_id
      area_id: $area_id
      periodo: $periodo
    ) {
      id
      estudiante_id
      grado_id
      area_id
      periodo
      notaFinal
      createdAt
      updatedAt
      notas {
        id
        nombre
        valor
        porcentaje
        actividad_id
      }
      estudiante {
        id
        tipo_documento
        numero_identificacion
        fecha_nacimiento
        nombre_completo
        celular_padres
        grado_id
        pension_activa
      }
      grado {
        id
        nombre
        director_id
      }
      area {
        id
        nombre
      }
    }
  }
`;