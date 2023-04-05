import type { VulcanDocument } from "@vulcanjs/schema";

type MongoDoc<TModel> = {
  toJSON?: () => TModel;
  _id?: MongoObjectId;
};
// TODO: we don't want a dependency to Mongo here
// Yet, we want Vulcan to support any type of _id that supports equality check
// Usually, it means string, but in Mongo they can be ObjectId as well
type MongoObjectId = { toString: () => string };
type MongoId = string | MongoObjectId;

/**
 * Converts Mongo ObjectId to string
 *
 * NOTE: technically this would work for any kind of collection that
 * return Ids with "toString" method, that's why it belongs to the generic "CRUD" package
 *
 * Connectors are expected to use string ids
 * It was the default behaviour in Meteor for Mongo,
 * but Mongoose/raw Mongo default behaviour is to use ObjectId
 *
 * Also needed in default resolvers when calling a data source
 *
 * => we prefer string ids in Vulcan for a consistent representation, in particular
 * between the GraphQL client (that will always use string ids) and the server
 *
 * @deprecated Do not convert _id in connector, but instead prefer a graphql scalar server-side
 */
export function convertIdAndTransformToJSON<TModel extends VulcanDocument>(
  doc: MongoDoc<TModel>
): TModel & { _id: string };
export function convertIdAndTransformToJSON<TModel extends VulcanDocument>(
  docs: Array<MongoDoc<TModel>>
): Array<TModel & { _id: string }>;
export function convertIdAndTransformToJSON<TModel extends VulcanDocument>(
  docOrDocs: MongoDoc<TModel> | Array<MongoDoc<TModel>>
): (TModel & { _id: string }) | Array<TModel & { _id: string }> {
  if (!Array.isArray(docOrDocs)) {
    const doc = docOrDocs;
    if (!doc)
      throw new Error(
        "Document is not defined during id transformation. You may have malformed documents in your database."
      );
    if (!doc._id) {
      throw new Error(
        `Document has no valid _id ${JSON.stringify(
          document
        )} during id transformation. You may use malformed document _id
          in your database (coming from Meteor?)`
      );
    }
    return {
      ...(doc.toJSON ? doc.toJSON() : doc),
      _id: doc._id.toString(),
    } as TModel & { _id: string };
  } else {
    return docOrDocs.map((doc) => {
      if (!doc._id) {
        throw new Error(
          `Document has no valid _id ${JSON.stringify(
            doc
          )} during id transformation. You may use malformed document _id
          in your database (coming from Meteor?)`
        );
      }
      return {
        ...(doc.toJSON ? doc.toJSON() : doc),
        _id: doc._id.toString(),
      } as TModel & { _id: string };
    });
  }
}

/**
 * Converts Mongoose document to JSON result
 *
 * /!\ The _id is still an ObjectId, but you should not care
 *
 * NOTE: technically this would work for any kind of collection that
 * return Ids with "toString" method, that's why it belongs to the generic "CRUD" package
 *
 * Connectors are expected to use string ids
 * It was the default behaviour in Meteor for Mongo,
 * but Mongoose/raw Mongo default behaviour is to use ObjectId
 *
 * Also needed in default resolvers when calling a data source
 *
 * => we prefer string ids in Vulcan for a consistent representation, in particular
 * between the GraphQL client (that will always use string ids) and the server
 */
export function convertToJSON<TModel extends VulcanDocument>(
  doc: MongoDoc<TModel>
): TModel & { _id: MongoId };
export function convertToJSON<TModel extends VulcanDocument>(
  docs: Array<MongoDoc<TModel>>
): Array<TModel & { _id: MongoId }>;
export function convertToJSON<TModel extends VulcanDocument>(
  docOrDocs: MongoDoc<TModel> | Array<MongoDoc<TModel>>
): (TModel & { _id: MongoId }) | Array<TModel & { _id: MongoId }> {
  if (!Array.isArray(docOrDocs)) {
    const doc = docOrDocs;
    if (!doc)
      throw new Error(
        "Document is not defined during id transformation. You may have malformed documents in your database."
      );
    return {
      ...(doc.toJSON ? doc.toJSON() : doc),
    } as TModel & { _id: MongoId };
  } else {
    return docOrDocs.map((doc) => {
      return {
        ...(doc.toJSON ? doc.toJSON() : doc),
      } as TModel & { _id: MongoId };
    });
  }
}
