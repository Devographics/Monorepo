import {
  SurveyMetadata,
  EditionMetadata,
  DbPathsEnum,
} from "@devographics/types";
import { Schema, extendSchema } from "~/lib/schemas";
import { nanoid } from "nanoid";
import { getCompletionPercentage, getKnowledgeScore } from "./helpers";
import { getFormPaths } from "~/lib/surveys/helpers";
import { captureException } from "@sentry/nextjs";

export enum Actions {
  CREATE = "create",
  UPDATE = "update",
}

export const emailPlaceholder = "*****@*****";

export const responseBaseSchema: Schema = {
  _id: {
    type: String,
    requiredDuring: Actions.CREATE,
    // Important: generate string ids here, otherwise Mongo will use ObjectIds
    onCreate: () => nanoid(),
  },
  createdAt: {
    type: Date,
    requiredDuring: Actions.CREATE,
    onCreate: () => new Date(),
  },
  updatedAt: {
    type: Date,
    requiredDuring: Actions.UPDATE,
    onUpdate: () => new Date(),
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
    clientMutable: true,
  },
  /**
   * NOTE: this userId is only present in Response
   * It is removed in the NormalizedResponse that can be made public
   */
  userId: {
    type: String,
    requiredDuring: Actions.CREATE,
    onCreate: ({ currentUser }) => currentUser._id,
  },

  // custom properties

  year: {
    type: Number,
    onCreate: ({ edition }) => {
      return edition.year;
    },
  },
  duration: {
    type: Number,
    onUpdate: ({ existingResponse }) => {
      const updatedAt = new Date();
      const createdAt = existingResponse.createdAt as Date;
      if (!createdAt) {
        captureException(
          `duration callback error: response ${existingResponse._id} missing createdAt field`
        );
        return;
      }
      const differenceInMilliseconds =
        updatedAt.getTime() - createdAt.getTime();
      const differenceInMinutes = differenceInMilliseconds / 1000 / 60;
      return differenceInMinutes;
    },
  },
  completion: {
    type: Number,
    onCreate: () => 0,
    onUpdate: ({ edition, updatedResponse }) =>
      updatedResponse &&
      getCompletionPercentage({
        response: updatedResponse,
        edition,
      }),
  },
  knowledgeScore: {
    type: Number,
    onUpdate: ({ edition, updatedResponse }) =>
      updatedResponse &&
      getKnowledgeScore({ response: updatedResponse, edition }).score,
  },
  locale: {
    type: String,
    clientMutable: true,
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
    onCreate: ({ survey }) => survey.id,
    clientMutable: true,
  },
  editionId: {
    type: String,
    requiredDuring: Actions.CREATE,
    onCreate: ({ edition }) => edition.id,
    clientMutable: true,
  },
  isNormalized: {
    type: Boolean,
    onUpdate: () => false,
  },
  receiveNotifications: {
    type: Boolean,
    clientMutable: true,
  },
  email: {
    type: String,
    clientMutable: true,
  },
  readingList: {
    type: String,
    clientMutable: true,
    isArray: true,
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
    onCreate: ({ currentUser }) => {
      return currentUser?.authMode;
    },
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
      const formPaths = getFormPaths({ edition, question });
      for (const formPath in formPaths) {
        // responses can sometimes be numeric, everything else is string
        const type =
          question.optionsAreNumeric && formPath === DbPathsEnum.RESPONSE
            ? Number
            : String;
        editionSchema[formPaths[formPath]] = {
          type,
          required: false,
          clientMutable: true,
          isArray: formPath === DbPathsEnum.RESPONSE && question.allowMultiple,
        };
      }
    }
  }
  const schema = { ...responseBaseSchema, ...editionSchema };
  const extendedSchema = extendSchema(schema);
  return extendedSchema;
};
