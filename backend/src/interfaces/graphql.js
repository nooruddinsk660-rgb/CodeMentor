const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('../graphql/schema');
const resolvers = require('../graphql/resolvers');
const context = require('../graphql/context');
const config = require('../core/config/env');

async function registerGraphQLEndpoint(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    playground: config.isDevelopment(),
    introspection: config.isDevelopment()
  });
  
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  
  return server;
}

module.exports = { registerGraphQLEndpoint };