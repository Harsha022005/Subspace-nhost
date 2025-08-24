
import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { nhost } from './nhost';

const HASURA_HTTP_URL = 'https://mgaffvhkvdrrhibqcqkp.hasura.ap-south-1.nhost.run/v1/graphql';
const HASURA_WS_URL = 'wss://mgaffvhkvdrrhibqcqkp.hasura.ap-south-1.nhost.run/v1/graphql';

const httpLink = new HttpLink({ uri: HASURA_HTTP_URL });

const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken();
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: HASURA_WS_URL,
    connectionParams: async () => {
      const token = await nhost.auth.getAccessToken();
      return {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      };
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});