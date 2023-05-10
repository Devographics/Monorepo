import { VulcanGraphqlModelServer } from "@vulcanjs/graphql/server";
import type { Connector } from "@vulcanjs/crud/server";
import { MongoDataSource } from "apollo-datasource-mongodb";

/**
 * Create a mongoose data source
 * @param model
 * @param connector
 * @returns
 */
export const createMongoDataSource = (
  model: VulcanGraphqlModelServer,
  connector: Connector
) => {
  const rawCollection = connector.getRawCollection();
  if (!rawCollection) {
    console.warn(`Model ${model.name} has no rawCollection in its connector. If it is not a Mongoose model, please
    manually provide a dataSource in model.graphql options.`);
    return undefined;
  }
  // TODO: check that it's a mongoose model?
  const mongooseModel = rawCollection as unknown as any;
  return new MongoDataSource(mongooseModel);
};
