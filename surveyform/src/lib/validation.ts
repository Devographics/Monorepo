import { ResponseDocument } from "@devographics/core-models";
import {
  SurveyMetadata,
  EditionMetadata,
  SurveyStatusEnum,
} from "@devographics/types";
import { z } from "zod";
import { SchemaObject, Schema } from "./schemas";
import { getResponseSchema } from "~/lib/responses/schema";

export interface ServerErrorObject {
  id: string;
  message: string;
  status: number;
  properties?: any;
  error?: any;
  properties?: any;
}

export function ServerError(props: ServerErrorObject) {
  console.log("// ServerError");
  console.log(props);
  Object.keys(props).forEach((key) => {
    this[key] = props[key];
  });
}

export enum ActionContexts {
  CLIENT = "client",
  SERVER = "server",
}

export enum Actions {
  CREATE = "create",
  UPDATE = "update",
}

const getZodType = (type) => {
  switch (type) {
    case String:
    default:
      return z.string();
    case Boolean:
      return z.boolean();
    case Date:
      return z.date();
    case Number:
      return z.number();
  }
};

type ZodObject =
  | z.ZodString
  | z.ZodBoolean
  | z.ZodDate
  | z.ZodNumber
  | z.ZodOptional<z.ZodString>
  | z.ZodOptional<z.ZodBoolean>
  | z.ZodOptional<z.ZodDate>
  | z.ZodOptional<z.ZodNumber>;

const getZodObject = <T>({
  fieldName,
  schemaObject,
  action,
  context,
}: {
  fieldName: string;
  schemaObject: SchemaObject<T>;
  action: Actions;
  context: ActionContexts;
}): ZodObject => {
  const { type, requiredDuring, clientMutable } = schemaObject;
  /*
    A field is required if:

    1. we are processing a CREATE (or UPDATE) action, and the field is required on CREATE (or UPDATE)
    2.  A) the field is mutable from the client, and this is a CLIENT context
        OR
        B) the field is NOT mutable from the client, and this is a SERVER context
  */
  const isRequired =
    requiredDuring === action &&
    (clientMutable
      ? context === ActionContexts.CLIENT
      : context === ActionContexts.SERVER);

  let zType = getZodType(type);
  if (zType === z.string()) {
    zType = zType.max(500);
  }
  return isRequired ? zType : zType.optional();
};

const getZodSchema = ({
  schema,
  action,
  context,
}: {
  schema: Schema;
  action: Actions;
  context: ActionContexts;
}) => {
  const zObject = {};
  const allFieldNames = Object.keys(schema);
  // if we're validating client input, only keep fields that are mutable by client
  const fieldNames =
    context === ActionContexts.CLIENT
      ? allFieldNames.filter((key) => schema[key].clientMutable)
      : allFieldNames;
  // build Zod object
  fieldNames.forEach((fieldName) => {
    const schemaObject = schema[fieldName];
    zObject[fieldName] = getZodObject({
      fieldName,
      schemaObject,
      action,
      context,
    });
  });
  return z.object(zObject).strict();
};

export const validateResponse = ({
  currentUser,
  existingResponse,
  updatedResponse,
  clientData,
  serverData,
  survey,
  edition,
  action,
}: {
  currentUser: any;
  existingResponse?: ResponseDocument;
  updatedResponse?: ResponseDocument;
  clientData: ResponseDocument;
  serverData: ResponseDocument;
  survey: SurveyMetadata;
  edition: EditionMetadata;
  action: Actions;
}) => {
  // check that user can perform action
  if (action === Actions.UPDATE) {
    if (existingResponse) {
      if (existingResponse.userId !== currentUser._id) {
        throw new ServerError({
          id: "update_not_authorized",
          message: `User ${currentUser._id} not authorized to perform UPDATE on document ${existingResponse._id}`,
          status: 400,
        });
      }
    } else {
      throw new ServerError({
        id: "no_existing_response",
        message: `Cannot validate UPDATE operation without an existing response`,
        status: 400,
      });
    }
  }

  // check that edition is open
  if (edition.status === SurveyStatusEnum.CLOSED) {
    throw new ServerError({
      id: "survey_closed",
      message: `Survey ${edition.id} is currently closed, operation failed`,
      status: 400,
    });
  }

  const schema = getResponseSchema({ survey, edition });
  const clientSchema = getZodSchema({
    schema,
    action,
    context: ActionContexts.CLIENT,
  });
  const serverSchema = getZodSchema({
    schema,
    action,
    context: ActionContexts.SERVER,
  });

  // parse client data
  try {
    clientSchema.parse(clientData);
  } catch (error) {
    throw new ServerError({
      id: "client_data_validation_error",
      message: `Encountered an error while validating client data during ${action}`,
      status: 400,
      error,
    });
  }

  // parse server data
  try {
    serverSchema.parse(serverData);
  } catch (error) {
    throw new ServerError({
      id: "server_data_validation_error",
      message: `Encountered an error while validating server data during ${action}`,
      status: 400,
      error,
    });
  }
};
