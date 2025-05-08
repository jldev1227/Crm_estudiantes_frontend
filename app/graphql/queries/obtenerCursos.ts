import { gql } from "@apollo/client";

export const OBTENER_CURSOS = gql`
    query ObtenerCursos {
        obtenerCursos {
            id
            nombre
            director {
                id
                nombre_completo
            }
        }
    }

`;
