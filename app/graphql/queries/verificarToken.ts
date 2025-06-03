import { gql } from "@apollo/client";

export const VERIFY_TOKEN = gql`
  query VerifyToken {
    verifyToken {
      valid
      user {
        id
        rol
      }
    }
  }
`;
