import { ResponseDocument } from "@devographics/core-models";
import { SurveyMetadata, EditionMetadata } from "@devographics/types";
import { z } from "zod";
import { getQuestionObject } from "~/surveys/parser/parseSurvey";

export enum ActionContexts {
  CLIENT = "client",
  SERVER = "server",
}

export enum Actions {
  CREATE = "create",
  UPDATE = "update",
}

interface SchemaObject {
  type?:
    | DateConstructor
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor;
  requiredDuring?: Actions;
  clientMutable?: boolean;
}

type Schema = {
  [key in string]: SchemaObject;
};

/*

All fields can only be accessed by document owner.

Some fields can be mutated by owner from client; or else only from server

*/

const defaultSchemaObject: SchemaObject = {
  type: String,
  requiredDuring: undefined,
  clientMutable: false,
};

export const responseBaseSchema: Schema = {
  _id: {
    type: String,
    requiredDuring: Actions.CREATE,
  },
  createdAt: {
    type: Date,
    requiredDuring: Actions.CREATE,
  },
  updatedAt: {
    type: Date,
    requiredDuring: Actions.UPDATE,
  },
  // unlike updatedAt, this tracks when the user clicked "submit" on the client,
  // not when the server finished the update
  lastSavedAt: {
    type: Date,
    requiredDuring: Actions.UPDATE,
    clientMutable: true,
  },
  // tracks the most recent time the user reached the end of the survey
  finishedAt: {
    type: Date,
  },
  /**
   * NOTE: this userId is only present in Response
   * It is removed in the NormalizedResponse that can be made public
   */
  userId: {
    type: String,
    requiredDuring: Actions.CREATE,
  },

  // custom properties

  year: {
    type: Number,
  },
  duration: {
    type: Number,
  },
  completion: {
    type: Number,
  },
  knowledgeScore: {
    type: Number,
  },
  locale: {
    type: String,
  },
  isSynced: {
    type: Boolean,
  },
  //   emailHash: {
  //     canCreate: ["members"],
  //     canUpdate: ["admins"],
  //   },
  isSubscribed: {
    type: Boolean,
    clientMutable: true, // ?
  },
  surveyId: {
    type: String,
    requiredDuring: Actions.CREATE,
  },
  editionId: {
    type: String,
    requiredDuring: Actions.CREATE,
  },
  isNormalized: {
    type: Boolean,
  },
  /*
    NOTE: this field will exist in the database, but is only used in the admin area
    Currently (09/2022) the admin area doesn't use this field but instead rely on a virtual field with a
    "reversed relation" to get the normalizedResponse from a response
    However the normalization adds this field in the db for convenience of future changes
    normalizedResponseId: {
      type: String,
      
      canRead: ["admins"],
      canCreate: ["admins"],
      canUpdate: ["admins"],
    },
    */
  //   isFinished: {
  //     type: Boolean,
  //     canCreate: ["members"],
  //     canUpdate: ["members"],
  //   },
  common__user_info__authmode: {
    type: String,
    clientMutable: true,
  },
  common__user_info__device: {
    type: String,
    clientMutable: true,
  },
  common__user_info__browser: {
    type: String,
    clientMutable: true,
  },
  common__user_info__version: {
    type: String,
    clientMutable: true,
  },
  common__user_info__os: {
    type: String,
    clientMutable: true,
  },
  common__user_info__referrer: {
    type: String,
    clientMutable: true,
  },
  common__user_info__source: {
    type: String,
    clientMutable: true,
  },
};

const extendSchema = (schema) => {
  Object.keys(schema).forEach((key) => {
    schema[key] = { ...defaultSchemaObject, ...schema[key] };
  });
  return schema;
};

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

const getZodObject = ({
  key,
  schemaObject,
  action,
  context,
}: {
  key: string;
  schemaObject: SchemaObject;
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
  Object.keys(schema).forEach((key) => {
    const schemaObject = schema[key];
    zObject[key] = getZodObject({ key, schemaObject, action, context });
  });
  return z.object(zObject);
};

const getResponseSchema = ({
  survey,
  edition,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
}) => {
  const editionSchema = {};
  for (const section of edition.sections) {
    for (const question of section.questions) {
      const questionObject = getQuestionObject({
        survey,
        edition,
        section,
        question,
      });
      for (const formPath in questionObject.formPaths) {
        // responses can sometimes be numeric, everything else is string
        const type =
          questionObject.optionsAreNumeric && formPath === "response"
            ? Number
            : String;
        editionSchema[questionObject.formPaths[formPath]] = {
          type,
          required: false,
          clientMutable: true,
        };
      }
    }
  }
  const schema = { ...responseBaseSchema, ...editionSchema };
  const extendedSchema = extendSchema(schema);
  return extendedSchema;
};

export const validateResponse = ({
  user,
  existingResponse,
  clientData,
  serverData,
  survey,
  edition,
  action,
}: {
  user: any;
  existingResponse?: ResponseDocument;
  clientData: ResponseDocument;
  serverData: ResponseDocument;
  survey: SurveyMetadata;
  edition: EditionMetadata;
  action: Actions;
}) => {
  if (action === Actions.UPDATE) {
    if (existingResponse) {
      if (existingResponse.userId !== user._id) {
        throw new Error(
          `User ${user._id} not authorized to perform UPDATE on document ${existingResponse._id}`
        );
      }
    } else {
      throw new Error(
        `Cannot validate UPDATE operation without an existing response`
      );
    }
  }

  const schema = getResponseSchema({ survey, edition });
  //   console.log("// validateResponse");
  //   console.log(schema);
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
  clientSchema.parse(clientData);
  serverSchema.parse(serverData);
};
