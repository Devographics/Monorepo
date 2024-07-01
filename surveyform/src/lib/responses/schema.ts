// "use server"
import {
  SurveyMetadata,
  EditionMetadata,
  DbPathsEnum,
  DbSubPaths,
} from "@devographics/types";
import { Schema, extendSchema } from "~/lib/schemas";
import { nanoid } from "nanoid";
import { getCompletionPercentage, getKnowledgeScore } from "./helpers";
import { getFormPaths } from "@devographics/templates";
// import { captureException } from "@sentry/nextjs";
import { serverConfig } from "~/config/server";

export enum Actions {
  CREATE = "create",
  UPDATE = "update",
}

export const emailPlaceholder = "*****@*****";

const isValidNumber = (n): n is number => typeof n === "number" && !isNaN(n);
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
        // captureException(
        //   `duration callback error: response ${existingResponse._id} missing createdAt field`
        // );
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
    // TODO: TS doesn't catch typing errors here based on "type"
    onUpdate: ({ edition, updatedResponse, existingResponse }): number => {
      const up =
        updatedResponse &&
        getCompletionPercentage({
          response: updatedResponse,
          edition,
        });
      // Zod is adamant in getting a correct value, be careful not to corrupt it
      if (isValidNumber(up)) return up;
      // in case data where corrupted
      if (isValidNumber(existingResponse.completion))
        return existingResponse.completion;
      return 0;
    },
  },
  knowledgeScore: {
    type: Number,
    // TODO: TS doesn't catch typing errors here based on "type"
    // Zod is adamant in getting a correct value, be careful not to corrupt it
    onUpdate: ({ edition, updatedResponse, existingResponse }): number => {
      const up =
        updatedResponse &&
        getKnowledgeScore({ response: updatedResponse, edition }).score;
      if (isValidNumber(up)) {
        return up;
      }
      if (isValidNumber(existingResponse.knowledgeScore)) {
        return Number(existingResponse.knowledgeScore);
      }
      return 0;
    },
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
  /** state_of_js */
  surveyId: {
    type: String,
    requiredDuring: Actions.CREATE,
    onCreate: ({ survey }) => survey.id,
    clientMutable: true,
  },
  /** js2023 */
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
  /**
   * Versionning the response
   */
  deploymentCommit: {
    type: String,
    clientMutable: false,
    onCreate() {
      return serverConfig().deploymentCommit;
    },
    onUpdate({ existingResponse }) {
      return (
        serverConfig().deploymentCommit || existingResponse?.deploymentCommit
      );
    },
  },
};

export const createFieldType = ({
  isNumeric = false,
  isArray = false,
  isBoolean = false,
  isRequired = false,
}: {
  isNumeric?: boolean;
  isArray?: boolean;
  isBoolean?: boolean;
  isRequired?: boolean;
}) => {
  // responses can sometimes be numeric, everything else is string
  const type = isBoolean ? Boolean : isNumeric ? Number : String;
  const typeObject = {
    type,
    required: isRequired,
    clientMutable: true,
    isArray,
  };
  return typeObject;
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
        const formPathContents = formPaths[formPath];
        /*

        formPathContents can either be a string:

        html2023__user_info__how_did_user_find_out_about_the_survey

        Or an object:

        {
          never_heard: 'html2023__features__window_controls_overlay__never_heard__followup_predefined',
          heard: 'html2023__features__window_controls_overlay__heard__followup_predefined',
          used: 'html2023__features__window_controls_overlay__used__followup_predefined'
        }

        */
        if (formPath === DbPathsEnum.SKIP) {
          const fieldPath = formPathContents;
          editionSchema[fieldPath] = createFieldType({
            isBoolean: true,
          });
        } else if (formPath === DbPathsEnum.SUBPATHS) {
          // for now assume that any subPath value (used for e.g. Likert scales)
          // is an individual value
          const subPaths = formPathContents as DbSubPaths;
          for (const subPath of Object.values(subPaths)) {
            // accept either an array or an individual value
            editionSchema[subPath] = createFieldType({
              isArray: false,
              isNumeric: question.optionsAreNumeric,
            });
          }
        } else if (typeof formPathContents === "object") {
          const subPaths = formPathContents as DbSubPaths;
          for (const subPath of Object.values(subPaths)) {
            // accept either an array or an individual value
            editionSchema[subPath] = createFieldType({ isArray: true });
          }
        } else {
          const fieldPath = formPathContents;
          const isNumeric = !!(
            formPath === DbPathsEnum.RESPONSE && question.optionsAreNumeric
          );
          const isArray = !!(
            formPath === DbPathsEnum.RESPONSE && question.allowMultiple
          );
          const isRequired = !!(
            formPath === DbPathsEnum.RESPONSE && question.isRequired
          );
          editionSchema[fieldPath] = createFieldType({
            isNumeric,
            isArray,
            isRequired,
          });
        }
      }
    }
  }
  const schema = { ...responseBaseSchema, ...editionSchema };
  const extendedSchema = extendSchema(schema);
  return extendedSchema;
};
