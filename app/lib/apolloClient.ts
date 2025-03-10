import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Configura la URL del servidor GraphQL
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
});

// Link para autenticar la solicitud con el token almacenado en localStorage
const authLink = setContext((operation, { headers = {} }) => {
  // Evitar error de "localStorage is not defined" en SSR
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Ajusta la condición para no agregar 'Authorization' si estás en un login
  // Uso de paréntesis para evitar que la comparación sea evaluada de forma incorrecta
  if (
    !token &&
    (operation.operationName === 'LoginEstudiante' ||
      operation.operationName === 'LoginMaestro')
  ) {
    return {
      headers: {
        ...headers,
      },
    };
  }

  // Si no hay token, simplemente retorna el resto de headers
  if (!token) {
    return {
      headers: {
        ...headers,
      },
    };
  }

  // De lo contrario, incluye el token en la cabecera Authorization
  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
  };
});

// Inicializa el Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;
