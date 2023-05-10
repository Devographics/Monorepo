import {
    MongoClient,
    Collection,
    Filter,
    ObjectId,
    OptionalUnlessRequiredId,
} from "mongodb";
// TODO: how to replace this type?
import { VulcanModel } from "@vulcanjs/model";
// Compute a Mongo selector
import { filterFunction } from "./mongoParams";

import { Connector, convertToJSON } from "@vulcanjs/crud/server";
import { VulcanDocument } from "@vulcanjs/schema";

type QueryOptions = any
export type MongoConnector<TDocument extends VulcanDocument> = Connector<
    TDocument,
    Filter<TDocument>,
    Pick<QueryOptions, "skip" | "limit">,
    Collection<TDocument>
>;

export interface MongoConnectorOptions {
    /**
     * Will automatically convert your Mongo document
     * to serializable JSON documents, with string ids
     */
    useStringId?: Boolean;
    /**
     * Mongo Client
     *
     * /!\ The connector won't handle the connection for you
     * Make sure to check the client connection before calling any of its method
     */
    mongoClient: MongoClient;
    /**
     * Will use model.name if not specified
     */
    collectionName?: string;
}
export const createMongoConnector = <TDocument extends VulcanDocument>(
    model: VulcanModel,
    options: MongoConnectorOptions
): MongoConnector<TDocument> => {
    const mongoClient = options.mongoClient;
    const collectionName = options.collectionName || model.name;
    // 1. use, retrieve or create the mongoose model
    // TODO: get a better key than "model.name" eg "model.mongo.collectionName"
    const mongoCollection = mongoClient
        .db()
        .collection<TDocument>(collectionName);
    // 2. create the connector
    return {
        find: async (selector, options) => {
            const cursor = mongoCollection.find(selector || {});
            if (options) {
                const { skip, limit } = options;
                if (typeof skip !== "undefined") {
                    cursor.skip(skip);
                }
                if (typeof limit !== "undefined") {
                    cursor.limit(limit);
                }
            }
            const found = await cursor.toArray();
            return convertToJSON<TDocument>(found);
        },
        findOne: async (selector) => {
            const query = selector
                ? mongoCollection.findOne(selector)
                : mongoCollection.findOne();
            const found = await query;
            const document = found && convertToJSON<TDocument>(found);
            return document;
        },
        findOneById: async (id) => {
            const found = await mongoCollection.findOne({ _id: id });
            if (!found) {
                return null;
            }
            const document = convertToJSON<TDocument>(found);
            return document;
        },
        count: async (selector) => {
            const count = await mongoCollection.countDocuments(selector || {});
            return count;
        },
        create: async (document) => {
            // Import: this will guarantee unique _id, as STRING instead of ObjectId
            // No need to cast on other operations, ids will always be string
            // /!\ When calling the mongo driver manually, don't forget to do this as well?
            let stringId;
            if (options.useStringId) {
                stringId = new ObjectId().toString();
                (document as VulcanDocument)._id = stringId;
            }
            const insertResult = await mongoCollection.insertOne(
                document as OptionalUnlessRequiredId<TDocument>
            );
            const createdId = insertResult.insertedId || stringId;
            const createdDocument = await mongoCollection.findOne({
                _id: createdId as any,
            });
            if (!createdDocument) {
                throw new Error(
                    `Document was not correctly created for _id ${createdId}`
                );
            }
            return convertToJSON(createdDocument);
        },
        update: async (selector, modifier, options) => {
            if (options) {
                console.warn(
                    "update do not implement options yet",
                    "selector:",
                    selector,
                    "options:",
                    options
                );
            }
      /*const updateResult = */ await mongoCollection.updateOne(
                selector,
                modifier
            );
            // NOTE: update result is NOT the updated document but the number of updated docs
            // we need to fetch it again
            const updatedDocument = await mongoCollection.findOne(selector);
            if (!updatedDocument) {
                // TODO: This may legitimately happen if the document modify its own selector, how to handle that?
                throw new Error(`Updated document was not found after the update`);
            }
            return convertToJSON(updatedDocument);
        },
        delete: async (selector) => {
            // NOTE: we don't return deleted document, as this is a deleteMany operation
            // const docFromDb = await MongooseModel.findOne(selector).exec();
            // const deletedRawDocument =
            //   docFromDb && convertIdAndTransformToJSON<TModel>(docFromDb);
            // const deletedDocument = deletedRawDocument;
            await mongoCollection.deleteMany(selector);
            return true; //deletedDocument;
        },
        // This function is meant at generating options for Find and select
        // @ts-ignore The TS error stems from the fact that Mongoose and Mongo use slightly different types
        // We would need to change the filterFunction to use Mongo as a default
        // However it will seldom raise issues, it concerns only selectors such as $where
        _filter: async (input, context) => {
            return await filterFunction(model, input, context);
            //return { selector: {}, filteredFields: [], options: {} };
        },
        getRawCollection: () => {
            return mongoCollection;
        },
    };
};
