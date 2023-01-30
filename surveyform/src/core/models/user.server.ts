/**
 * Extends user.ts with server-side logic
 * 
 * TODO: is this still used??
 */
import merge from "lodash/merge.js";

import {
  CreateGraphqlModelOptionsServer,
  createGraphqlModelServer,
  VulcanGraphqlSchemaServer,
} from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";

import {
  schema as clientSchema,
  modelDef as clientModelDef,
  UserType as UserTypeShared,
  NewUserDocument,
} from "./user";
import { restrictDocuments } from "@vulcanjs/permissions";
import { ResponseMongoCollection } from "~/responses/model.server";
import mongoose from "mongoose";

/**
 * User + hashed password
 *
 * Only for non-anonymous users, use this type for Mongoose
 */
export type UserWithEmailServer = UserTypeShared & {
  hash?: string;
  salt?: string;
};
export type UserTypeServer = UserTypeShared & { hash?: string; salt?: string };

/**
 * Add userId to a document
 * @param data
 */
const guaranteeOwnership = (data) => {
  // TODO: put _id into userId to guarantee ownership
  data.userId = data._id;
  return data;
};

// Previously in Users API schema
//import Responses from "~/responses/collection";
//import Users from "meteor/vulcan:users";

const apiSchema: VulcanGraphqlSchemaServer = {
  responses: {
    // TODO: we have to repeat everything for the field to correctly appear in the schema
    type: Array,
    canRead: ["owners"],
    typeName: "[Response]",
    resolveAs: {
      fieldName: "responses", // TODO: not sure if actually mandatory when we reuse the same name
      typeName: "[Response]",
      resolver: async (user, args, { currentUser }) => {
        if (!user?._id) {
          captureMessage(
            "Tried to fetch user responses but user has no _id or is not defined"
          );
          return null;
        }
        // TODO: use a "querier" instead, that would
        // embed the document restriction directly, run callbacks etc.
        // const responses = await ResponseConnector.find({
        //   userId: user._id,
        // });
        const Responses = ResponseMongoCollection()
        const cursor = await Responses.find({
          userId: user._id,
        })
        const responses = await cursor.toArray();

        // TODO: it's currently hard to access the server model this way
        // There are no user sensitive fields in users' own responses anyway
        // only a few internal fields
        const restrictedResponses = responses
        /*
        const restrictedResponses = restrictDocuments({
          user: currentUser, //user,
          model: Response,
          documents: responses,
        */
        return restrictedResponses;
      },
    },
  },
};

// For string ids
import { nanoid } from "nanoid";
import { createEmailHash } from "~/account/email/api/encryptEmail";
import { captureMessage } from "@sentry/node";
const schema: VulcanGraphqlSchemaServer = merge(
  {},
  clientSchema,
  {
    ...apiSchema,
    // MANDATORY when using string ids for a collection instead of ObjectId
    // you have to handle the id creation manually
    _id: {
      onCreate: () => {
        // generate a random value for the id
        const _id = nanoid();
        return _id;
      },
    },
  } /* as VulcanGraphqlSchemaServer*/
);

/**
 * Important: we hash the email on creation or update
 * @param data
 * @param props
 * @returns
 */
const hashEmailBeforeSave = (data: NewUserDocument, props) => {
  if (data.email) {
    data.emailHash = createEmailHash(data.email);
    delete data.email;
  }
  return data as UserTypeServer;
};

const modelDef: CreateGraphqlModelOptionsServer = merge({}, clientModelDef, {
  graphql: {
    // server only fields
    callbacks: {
      create: {
        // legacy password cleanup
        before: [hashEmailBeforeSave],
        after: [guaranteeOwnership],
      },
      update: {
        before: [hashEmailBeforeSave],
      },
    },
  },
  schema,
});
export const User = createGraphqlModelServer(modelDef);

const UserConnector = createMongooseConnector<UserWithEmailServer>(User, {
  // We will use "String" _id because we have a legacy db from Meteor
  mongooseSchema: new mongoose.Schema({ _id: String }, { strict: false }),
});

User.crud.connector = UserConnector;

export const UserMongooseModel =
  UserConnector.getRawCollection() as mongoose.Model<UserWithEmailServer>;
