import express, { Request } from "express";
import cors from "cors";
// import mongoose from "mongoose";
import { ApolloServer, gql } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import { buildApolloSchema, createDataSources } from "@vulcanjs/graphql/server";

import mongoConnection from "~/lib/server/middlewares/mongoConnection";
import corsOptions from "~/lib/server/cors";
import { contextFromReq } from "~/lib/server/context";
import models from "~/_vulcan/models.index.server";
//import { apiWrapper } from "~/lib/server/sentry";

// Custom graphql API from StateOfJS
import {
  typeDefs as sojsTypeDefs,
  resolvers as sojsResolvers,
} from "~/admin/server/graphql";
// Custom graphql API from Vulcan
import { graphql as i18nSchema } from "@vulcanjs/i18n/server";

/**
 * Example graphQL schema and resolvers generated using Vulcan declarative approach
 * http://vulcanjs.org/
 */
const vulcanRawSchema = buildApolloSchema(models);

// Temporary resolver for "currentUser", for faster migration
const currentUserTypeDefs = `type Query { 
  currentUser: User
 }`;

import { localesRegistry, stringsRegistry } from "~/i18n";

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
      // // hack to reuse the user API endpoint
      // // TODO: reuse the core logic to get current user more cleanly
      // let jsonRes;
      // const fakeRes = {
      //   status: () => ({
      //     json: (val) => {
      //       jsonRes = val;
      //     },
      //   }),
      // };
      // await user(req, fakeRes);
      // return jsonRes.user;
    },
  },
};

// NOTE: sojsTypedefs are implicitely expecting Vulcan default typedefs (usign JSON scalar for instance)
// so you cannot call makeExecutableSchema on them
// Instead, merge both schema and then only make them executable
//const { print } = require("graphql");
//console.log(print(mergeTypeDefs([vulcanRawSchema.typeDefs, sojsTypeDefs])));
const mergedSchema = {
  ...vulcanRawSchema,
  typeDefs: mergeTypeDefs([
    i18nSchema.typeDefs,
    vulcanRawSchema.typeDefs,
    sojsTypeDefs,
    currentUserTypeDefs,
  ]),
  resolvers: mergeResolvers([
    i18nSchema.makeResolvers({
      StringsRegistry: stringsRegistry,
      LocalesRegistry: localesRegistry,
    }),
    vulcanRawSchema.resolvers,
    sojsResolvers,
    currentUserResolver,
  ]),
};
const vulcanSchema = makeExecutableSchema(mergedSchema); //vulcanRawSchema);

/**
 * Example custom Apollo server, written by hand
 */
/*
const typeDefs = gql`
  type Query {
    restaurants: [Restaurant]
  }
  type Restaurant {
    _id: ID!
    name: String
  }
`;
const resolvers = {
  Query: {
    // Demo with mongoose
    // Expected the database to be setup with the demo "restaurant" API from mongoose
    async restaurants() {
      try {
        const db = mongoose.connection;
        const restaurants = db.collection("restaurants");
        // @ts-ignore
        const resultsCursor = (await restaurants.find(null, null)).limit(5);
        const results = await resultsCursor.toArray();
        return results;
      } catch (err) {
        console.log("Could not fetch restaurants", err);
        throw err;
      }
    },
  },
};
*/
/*
const customSchema = makeExecutableSchema({
  typeDefs: sojsTypeDefs,
  resolvers: sojsResolvers,
});
*/
// NOTE: schema stitching can cause a bad developer experience with errors
// And it means that both schema must be executable
//const mergedSchema = vulcanSchema; //mergeSchemas({ schemas: [vulcanSchema, customSchema] });

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) throw new Error("MONGO_URI env variable is not defined");

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
  formatError: (err) => {
    console.error(err);
    return err;
  },
});

await server.start();

const app = express();

app.set("trust proxy", true);

const gqlPath = "/api/graphql";
// setup cors
app.use(gqlPath, cors(corsOptions));
// init the db
// TODO: we should probably use the "connectToAppDbMiddleware"?
app.use(gqlPath, mongoConnection(mongoUri));

server.applyMiddleware({ app, path: "/api/graphql" });

export default app;

export const config = {
  api: {
    bodyParser: false,
  },
};
