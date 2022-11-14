import {
  CreateGraphqlModelOptionsServer,
  createGraphqlModelServer,
  mergeModelDefinitionServer,
} from "@vulcanjs/graphql/server";
import { modelDef as modelDefCommon } from "./model";
import { schema as schemaServer } from "./schema.server";
import { createMongooseConnector } from "@vulcanjs/mongo";
import { subscribe } from "~/server/email/email_octopus";
//import { createEmailHash } from "~/account/email/api/encryptEmail";

// import { updateElasticSearchOnCreate, updateElasticSearchOnUpdate } from '../elasticsearch/index';
// note: normalizing responses on every response update is too slow
// import { normalizeResponse } from '../normalization/normalize';

async function duplicateCheck(validationErrors, options) {
  const { document, currentUser } = options
  if (!document.surveySlug) {
    console.log(document);
    throw new Error(`duplicateCheck: document.surveySlug must be defined`);
  }
  if (!currentUser._id) {
    console.log(currentUser);
    throw new Error(`duplicateCheck: currentUser._id must be defined`);
  }
  console.log('// duplicateCheck')
  console.log(document)
  console.log(currentUser)
  const selector = {
    surveySlug: document.surveySlug,
    userId: currentUser._id,
  }
  console.log(selector)

  const existingResponse = await ResponseConnector.findOne(selector);
  if (existingResponse) {
    console.log('// existingResponse')
    console.log(existingResponse)
    validationErrors.push({
      break: true,
      id: "error.duplicate_response",
      message: "Sorry, you already have a session in progress for this survey.",
      properties: { responseId: existingResponse._id },
    });
  }
  // TODO: in vulcan next the check must return
  return validationErrors;
}

const emailPlaceholder = "*****@*****";
const emailFieldName = "email_temporary";

async function processEmailOnUpdate(data, properties) {
  const { document } = properties;
  const { surveySlug, emailHash, isSubscribed } = document;
  const survey = surveyFromResponse(document);
  const listId = survey?.emailOctopus?.listId;
  const emailFieldPath = `${surveySlug}__user_info__${emailFieldName}`;
  const email = data[emailFieldPath];
  // if user has entered their email
  if (email && email !== emailPlaceholder) {
    // try to subscribe them to the email list
    if (!isSubscribed) {
      try {
        subscribe({ email, listId });
      } catch (error) {
        // We do not hard fail on subscription error, just log to Sentry
        captureException(error);
        console.error(error);
      }
      data["isSubscribed"] = true;
    }

    // Note: do this separately after all, and only if we get permission
    // generate a hash and store it
    // if (!emailHash) {
    //   data["emailHash"] = createEmailHash(email);
    // }

    // replace the email with a dummy placeholder, effectively deleting it
    data[emailFieldPath] = emailPlaceholder;
  }
  return data;
}

export const modelDef: CreateGraphqlModelOptionsServer =
  mergeModelDefinitionServer(modelDefCommon, {
    schema: schemaServer,
    graphql: {
      callbacks: {
        create: {
          validate: [duplicateCheck],
        },
        update: {
          before: [processEmailOnUpdate],
        },
      },
    },
  });

export const Response = createGraphqlModelServer(modelDef);

type ResponseDocument = any;
import mongoose from "mongoose";
import { captureException } from "@sentry/nextjs";
import { surveyFromResponse } from "./helpers";
// Using Vulcan (limited to CRUD operations)
export const ResponseConnector = createMongooseConnector<ResponseDocument>(
  Response,
  {
    mongooseSchema: new mongoose.Schema({ _id: String }, { strict: false }),
  }
);
Response.crud.connector = ResponseConnector;

// Using Mongoose (advised)
export const ResponseMongooseModel =
  ResponseConnector.getRawCollection() as mongoose.Model<ResponseDocument>;

/**
 * For direct Mongo access (not advised, used only for aggregations)
 * NOTE: should be called only after the database is connected,
 * that's why it's a function
 */
export const ResponseMongoCollection = () => {
  if (!mongoose.connection.db) {
    throw new Error(
      "Trying to access Response mongo collection before Mongo/Mongoose is connected."
    );
  }
  return mongoose.connection.db.collection<ResponseDocument>("responses");
};
