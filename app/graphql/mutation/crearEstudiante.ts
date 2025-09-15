// En tu archivo de mutaciones
import { gql } from "@apollo/client";

export const CREAR_ESTUDIANTE = gql`
  mutation RegistrarEstudiante(
    $nombre_completo: String! 
    $celular_padres: String! 
    $tipo_documento: String! 
    $numero_identificacion: String! 
    $fecha_nacimiento: String! 
    $grado_id: String! 
    $password: String!
  ) {
    registrarEstudiante(
      nombre_completo: $nombre_completo
      celular_padres: $celular_padres
      tipo_documento: $tipo_documento
      numero_identificacion: $numero_identificacion
      fecha_nacimiento: $fecha_nacimiento
      grado_id: $grado_id
      password: $password
    ) {
      id
      nombre_completo
      numero_identificacion
    }
  }
`;