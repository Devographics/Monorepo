import type { SurveyMetadata, EditionMetadata } from "@devographics/types";
import { getQuestionObject } from "~/surveys/parser/parseSurvey";
import { Schema, extendSchema } from "./schemas";
// import { Actions } from "./validation";

export enum Actions {
  CREATE = "create",
  UPDATE = "update",
}

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

export const getResponseSchema = ({
  survey,
  edition,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
}): Schema => {
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
