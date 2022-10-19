/**
 * Context creation, for graphql but also REST endpoints
 */
import {
  VulcanGraphqlModel,
  VulcanGraphqlModelServer,
} from "@vulcanjs/graphql/server";
import { Connector } from "@vulcanjs/crud/server";

import { createMongooseConnector } from "@vulcanjs/mongo";
import { Request } from "express";
import debug from "debug";
import models from "~/_vulcan/models.index.server";
import { getLocaleFromReq } from "~/i18n/server/localeDetection";
import { userContextFromReq } from "./userContext";
// import mongoose from "mongoose";
const debugGraphqlContext = debug("vn:graphql:context");

/**
 * TODO: not sure if this is up to date
const models = [Tweek, Twaik];
 * Expected shape of the context
 * {
 *    "Foo": {
 *      model: Foo,
 *      connector: FooConnector
 *    }
 * }
 */
interface ModelContext {
  [typeName: string]: { model: VulcanGraphqlModel; connector: Connector };
}
/**
 * Build a default graphql context for a list of models
 * @param models
 */
const createContextForModels = (
  models: Array<VulcanGraphqlModelServer>
): ModelContext => {
  return models.reduce(
    (context, model: VulcanGraphqlModelServer) => ({
      ...context,
      [model.graphql.typeName]: {
        model,
        connector: model.crud.connector || createMongooseConnector(model),
      },
    }),
    {}
  );
};

// TODO: isolate context creation code like we do in Vulcan + initialize the currentUser too
export const contextBase = {
  ...createContextForModels(models),
};

interface LocaleApiContext {
  locale?: string;
}

const localeContextFromReq = async (req: Request) => {
  return { locale: getLocaleFromReq(req) };
};

export const contextFromReq = async (req: Request) => {
  // TODO
  const userContext = await userContextFromReq(req);
  const localeContext = await localeContextFromReq(req);
  const context = {
    ...contextBase,
    ...userContext,
    ...localeContext,
    // add HTTP request to context
    req,
  };
  debugGraphqlContext("Graphql context for current request:", context);
  return context;
};

/**
 * TODO: this type is not complete at all,
 * API context used by graphql also includes req object,
 * currentUser, etc.
 */
export interface ApiContext extends LocaleApiContext {}
