import express, { Request } from "express";
import cors from "cors";
// import mongoose from "mongoose";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import { buildApolloSchema, createDataSources } from "@vulcanjs/graphql/server";

import corsOptions from "~/lib/server/cors";
import { contextFromReq } from "~/lib/server/context";

import {
  typeDefs as sojsTypeDefs,
  resolvers as sojsResolvers,
} from "~/core/server/graphql";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";
import { getServerModels } from "~/_vulcan/models.index.server";
import { connectToRedisMiddleware } from "~/lib/server/redis";

// Temporary resolver for "currentUser", for faster migration
const currentUserTypeDefs = `type Query { 
  currentUser: User
 }`;
const currentUserResolver = {
  Query: {
    currentUser: async (root, any, { /*req*/ currentUser }) => {
      // TODO: req object is not always defined, why?
      // Anyway, currentUser is already computed in the context so
      // we return it direclty, without sensitive fields
      const user = currentUser;
      if (user) {
        user.hash = undefined;
        user.salt = undefined;
        user.password = undefined;
      }
      return user || null;
    },
  },
};

/**
 * Generates the graphql schema asynchronously,
 * based on survey definitions
 */
async function initServer() {
  const models = await getServerModels();
  /**
   * Example graphQL schema and resolvers generated using Vulcan declarative approach
   * http://vulcanjs.org/
   */
  const vulcanRawSchema = buildApolloSchema(models);

  // NOTE: sojsTypedefs are implicitely expecting Vulcan default typedefs (usign JSON scalar for instance)
  // so you cannot call makeExecutableSchema on them
  // Instead, merge both schema and then only make them executable
  //const { print } = require("graphql");
  //console.log(print(mergeTypeDefs([vulcanRawSchema.typeDefs, sojsTypeDefs])));
  const mergedSchema = {
    ...vulcanRawSchema,
    typeDefs: mergeTypeDefs([
      vulcanRawSchema.typeDefs,
      sojsTypeDefs,
      currentUserTypeDefs,
    ]),
    resolvers: mergeResolvers([
      vulcanRawSchema.resolvers,
      sojsResolvers,
      currentUserResolver,
    ]),
  };
  const vulcanSchema = makeExecutableSchema(mergedSchema);

  // Data sources avoid the N+1 problem in Mongo
  const createDataSourcesForModels = createDataSources(models);

  // Define the server (using Express for easier middleware usage)
  const server = new ApolloServer({
    schema: vulcanSchema, // mergedSchema,
    context: ({ req }) => contextFromReq(req as Request),
    // @see https://www.apollographql.com/docs/apollo-server/data/data-sources
    dataSources: () => ({
      ...createDataSourcesForModels(),
      /* Add your own dataSources here (their name must be DIFFERENT from the model names) */
    }),
    // Needs to be enabled
    introspection:
      process.env.NODE_ENV !== "production" ||
      // Enable Apollo Studio
      !!process.env.APOLLO_SCHEMA_REPORTING,
    plugins:
      process.env.NODE_ENV !== "production"
        ? [
            ApolloServerPluginLandingPageGraphQLPlayground({
              // @see https://www.apollographql.com/docs/apollo-server/api/plugin/landing-pages/#graphql-playground-landing-page
              // options
            }),
          ]
        : [],
    // Important otherwie Apollo swallows errors
    formatError: (err) => {
      console.error(err);
      return err;
    },
  });
  return server;
}

const app = express();
app.set("trust proxy", true);
const gqlPath = "/api/graphql";
// setup cors
app.use(gqlPath, cors(corsOptions));
// init the db
// TODO: we should probably use the "connectToAppDbMiddleware"?
app.use(gqlPath, connectToAppDbMiddleware);
app.use(gqlPath, connectToRedisMiddleware);

let serverPromise: Promise<void> | undefined = undefined;
app.use(gqlPath, async function (req, res, next) {
  if (!serverPromise)
    throw new Error("Got a first request before serverPromise was initialized");
  console.debug("waiting apollo server start");
  await serverPromise;
  console.debug("apollo server is started, will process request");
  next();
});
serverPromise = (async () => {
  const server = await initServer();
  await server.start();
  server.applyMiddleware({ app, path: "/api/graphql" });
})();

export default app;

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
