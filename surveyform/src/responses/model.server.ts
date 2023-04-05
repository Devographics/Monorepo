import {
  createGraphqlModel,
  CreateGraphqlModelOptionsServer,
  CreateGraphqlModelOptionsShared,
  createGraphqlModelServer,
  mergeModelDefinitionServer,
  VulcanGraphqlModelServer,
} from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";
import { subscribe } from "~/server/email/email_octopus";
import mongoose, { Connection } from "mongoose";
import { captureException } from "@sentry/nextjs";
import { fetchSurveyFromId } from "@devographics/core-models/server";
import { ResponseDocument, SurveyEdition } from "@devographics/core-models";
import { getSchema, getServerSchema, initResponseSchema } from "./schema.server";
import { canModifyResponse } from "./server/model";

function getReponseEditionId(response: ResponseDocument) {
  const editionId = response.editionId || response.surveySlug
  if (!editionId) {
    throw new Error(`response.editionId (or legacy surveySlug) must be defined`);
  }
  return editionId
}

/**
 * Check duplicate response
 * @param validationErrors 
 * @param options 
 * @returns 
 */
export async function duplicateCheck(validationErrors, options: {
  document: any,
  currentUser: any
}) {
  const { document, currentUser } = options;
  const editionId = getReponseEditionId(document)
  if (!currentUser._id) {
    throw new Error(`duplicateCheck: currentUser._id must be defined`);
  }
  const selector = {
    editionId,
    userId: currentUser._id,
  };

  const Responses = ResponseMongoCollection()
  const existingResponse = await Responses.findOne(selector);

  if (existingResponse) {
    console.log("// duplicateCheck");
    console.log("// selector");
    console.log(selector);
    console.log("// existingResponse");
    console.log(existingResponse);

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


export async function processEmailOnUpdate(data, properties) {
  const { document } = properties
  const { isSubscribed
  } = document as ResponseDocument;
  const editionId = getReponseEditionId(document)

  const survey = await fetchSurveyFromId(editionId)
  const listId = survey?.emailOctopus?.listId;
  const emailFieldPath = `${editionId}__user_info__${emailFieldName}`;
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

// Using Mongoose (advised)
export const ResponseMongooseModel = (conn: Connection = mongoose.connection) => conn.db.collection("responses")


// LEGACY CODE

export const getModelDefServer = (): CreateGraphqlModelOptionsServer => {
  return mergeModelDefinitionServer(getModelDef(), {
    schema: getServerSchema(),
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
    // NOTE: save_survey actually handles the permissions
    permissions: {
      canRead: ["owners", "admins"],
      canCreate: ["members"],
      // NOTE: save survey also check if the response can be updated
      // TODO: drop Vulcan system here
      // @ts-ignore
      canUpdate: ({ user, document: response }) => {
        return canModifyResponse(response as any, user as any);
      },
      canDelete: ["admins"],
    },
  });
}

let ResponseModel: VulcanGraphqlModelServer
//let isResponseModelReady = false
export const getResponseModel = () => {
  // if (!isResponseModelReady) throw new Error("Response model not ready")
  return ResponseModel
};


const name = "Response";

export function getModelDef() {
  const modelDef: CreateGraphqlModelOptionsShared = {
    name,
    schema: getSchema(),
    graphql: {
      typeName: name,
      multiTypeName: "Responses",
      defaultFragmentOptions: {
        // Some fields might be named "js_features_intl"
        // because they literally talk about _intl
        // we don't want them in the default fragment
        // TODO: we should probably provide our own default fragment
        // without survey fields anyway
        noIntlFields: true,
      },
    },
    permissions: {
      canRead: ["owners", "admins"],
      canCreate: ["members"],
      canUpdate: ['owners', 'admins'],
      canDelete: ["admins"],
    },
  };
  return modelDef
}

// TODO: unused client-side??
function initReponseModel(surveys: Array<SurveyEdition>) {
  initResponseSchema(surveys)
  return createGraphqlModel(getModelDef())
}
export const initResponseModelServer = (surveys: Array<SurveyEdition>) => {
  initReponseModel(surveys)
  ResponseModel = createGraphqlModelServer(getModelDefServer())
}

let ResponseConnector
// Using Vulcan (limited to CRUD operations)
export const initResponseConnector = () => {
  ResponseConnector = createMongooseConnector<ResponseDocument>(
    ResponseModel,
    {
      mongooseSchema: new mongoose.Schema({ _id: String }, { strict: false }),
    }
  );
  ResponseModel.crud.connector = ResponseConnector;
}



//  ResponseConnector.getRawCollection() as mongoose.Model<ResponseDocument>;

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


