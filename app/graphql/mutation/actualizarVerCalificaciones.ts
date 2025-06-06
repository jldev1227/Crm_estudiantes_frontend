// app/graphql/mutation/actualizarPension.js
import { gql } from "@apollo/client";

export const ACTUALIZAR_VER_CALIFICACIONES = gql`
  mutation ActualizarVerCalificaciones($id: ID!) {
    actualizarVerCalificaciones(id: $id) {
      id
      tipo_documento
      numero_identificacion
      fecha_nacimiento
      nombre_completo
      celular_padres
      password
      grado_id
      pension_activa
      ver_calificaciones
    }
  }
`;
