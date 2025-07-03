// graphql/queries/obtenerCalificacionesEstudiante.js
import { gql } from "@apollo/client";

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
      puesto {
        posicion
        total
        promedio
        percentil
      }
      estudiante {
        id
        nombre_completo
        numero_identificacion
        tipo_documento
        celular_padres
        grado {
          id
          nombre
          director_id
          director {
            id
            nombre_completo
            email
          }
        }
      }
      calificaciones {
        id
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
        area {
          id
          nombre
        }
      }
      indicadores {
        total
        lista {
          id
          nombre
          periodo
          area {
            id
            nombre
          }
        }
        porArea {
          area_id
          area_nombre
          indicadores {
            id
            nombre
            periodo
          }
        }
      }
    }
  }
`;
