/**
 * Extends user.ts with server-side logic
 */
import merge from "lodash/merge.js";

import {
  CreateGraphqlModelOptionsServer,
  createGraphqlModelServer,
  VulcanGraphqlSchemaServer,
} from "@vulcanjs/graphql/server";

import {
  schema as clientSchema,
  modelDef as clientModelDef,
  UserType as UserTypeShared,
  NewUserDocument,
} from "./user";
import { hashPassword } from "~/account/passwordLogin/api";
import { restrictDocuments } from "@vulcanjs/permissions";
import { ResponseConnector } from "~/modules/responses/model.server";
import { Response } from "~/modules/responses";

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

/**
 * Store hash and salt, and remove temporary password from form document
 * @deprecated We don't use password login anymore
 * @param data
 * @param props
 * @returns
 */
const handlePasswordCreation = (data: UserTypeServer, props) => {
  if (data.authMode && data.authMode !== "password") {
    // Skip password hashing, but delete password just in case
    delete data.password;
    return data;
  }
  const { password } = data;
  // const user = await DB.findUser(...)
  const { hash, salt } = hashPassword(password);
  data.hash = hash;
  data.salt = salt;
  // Do not store the password in the database
  data.password = null;
  return data;
};

/**
 * @deprecated We don't store password anymore
 * @param data
 * @returns
 */
const handlePasswordUpdate = (data) => {
  if (data.authMode === "passwordless") {
    // Skip password hashing, but delete password just in case
    delete data.password;
    return data;
  }
  const { password } = data;
  // update the hash
  if (password) {
    // const user = await DB.findUser(...)
    const { hash, salt } = hashPassword(data.password);
    data.hash = hash;
    data.salt = salt;
    // Do not store the password in the database
    data.password = null;
  }
  return data;
};

const passwordAuthSchema: VulcanGraphqlSchemaServer = {
  // password auth management
  hash: {
    type: String,
    canRead: [],
    canCreate: [],
    canUpdate: [],
  },
  salt: {
    type: String,
    canRead: [],
    canCreate: [],
    canUpdate: [],
  },
  // Example of a custom field resolver to get data from other API
  /*
  twitterId: {
    type: String,
    canRead: ["admins", "owners"],
    canCreate: ["admins"],
    canUpdate: ["admins"],
    resolveAs: {
      type: "JSON",
      resolver:(root, args, context) => {
        return {twiterHandle: "@VulcanJS"}
      }
    }
  }
   */
};

// Previously in Users API schema
//import Responses from "~/modules/responses/collection";
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
        // TODO: use a "querier" instead, that would
        // embed the document restriction directly, run callbacks etc.
        const responses = await ResponseConnector.find({
          userId: user._id,
        });
        // TODO: update when migrating the Responses model
        /*
        await Responses.find({
          userId: user._id,
        }).fetch();
        */
        const restrictedResponses = restrictDocuments({
          user: currentUser, //user,
          model: Response,
          documents: responses,
        });
        return restrictedResponses;
      },
    },
  },
};

// For string ids
import { nanoid } from "nanoid";
import { createEmailHash } from "~/account/email/api/encryptEmail";
const schema: VulcanGraphqlSchemaServer = merge(
  {},
  clientSchema,
  {
    ...passwordAuthSchema,
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
        before: [handlePasswordCreation, hashEmailBeforeSave],
        after: [guaranteeOwnership],
      },
      update: {
        before: [handlePasswordUpdate, hashEmailBeforeSave],
      },
    },
  },
  schema,
});
export const User = createGraphqlModelServer(modelDef);