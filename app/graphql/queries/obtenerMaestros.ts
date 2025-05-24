import { gql } from "@apollo/client";

export const OBTENER_MAESTROS = gql`
    query ObtenerMaestros {
        obtenerMaestros {
            id
            nombre_completo
            email
            celular
            tipo_documento
            numero_identificacion
        }
    }
`;
