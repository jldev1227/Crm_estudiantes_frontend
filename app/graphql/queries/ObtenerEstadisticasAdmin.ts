import { gql } from "@apollo/client";

// Consulta para obtener estadisticas del administrador
export const OBTENER_ESTADISTICAS_ADMIN = gql`
  query ObtenerEstadisticasAdmin {
    obtenerEstadisticasAdmin {
      totalEstudiantes
      totalMaestros
      totalActividades
      totalTareas
      totalCalificaciones
      totalGrados
      totalAreas
      totalUsuarios
    }
  }
`;
