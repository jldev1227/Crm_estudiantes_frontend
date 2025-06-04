import { gql } from "@apollo/client";

export const OBTENER_CALIFICACIONES_GRADO_COMPLETO = gql`
  query ObtenerCalificacionesGradoCompleto($grado_id: ID!, $periodo: Int!) {
    obtenerCalificacionesGradoCompleto(grado_id: $grado_id, periodo: $periodo) {
      grado_id
      periodo
      grado {
        id
        nombre
        director {
          id
          nombre_completo
        }
      }
      areas {
        id
        nombre
        maestro {
          id
          nombre_completo
        }
        actividades {
          id
          nombre
          porcentaje
          tipo
          orden
          activa
        }
        estudiantes {
          id
          tipo_documento
          numero_identificacion
          nombre_completo
          celular_padres
          calificacion_id
          nota_final_area
          estado_area
          notas_area {
            actividad_id
            nombre
            valor
            porcentaje
            completada
          }
        }
        estadisticas {
          total_estudiantes
          calificados
          sin_calificar
          promedio_area
          aprobados
          reprobados
          porcentaje_aprobacion
        }
      }
      estadisticas_generales {
        total_estudiantes
        total_areas
        promedio_general
        estudiantes_aprobados_todas_areas
        porcentaje_aprobacion_general
      }
    }
  }
`;
