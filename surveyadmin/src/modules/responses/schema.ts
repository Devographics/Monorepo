import surveys from "~/surveys";

import { getQuestionSchema } from "./helpers";
import { VulcanGraphqlSchema } from "@vulcanjs/graphql";
import {
  getQuestionId,
  getQuestionObject,
} from "~/modules/surveys/parser/parseSurvey";
import cloneDeep from "lodash/cloneDeep.js";
// import { addComponentToQuestionObject } from "~/modules/responses/customComponents";
import { VulcanFieldSchema } from "@vulcanjs/schema";

export const schema: VulcanGraphqlSchema = {
  // default properties

  _id: {
    type: String,
    optional: true,
    canRead: ["guests"],
  },
  createdAt: {
    type: Date,
    optional: true,
    canRead: ["owners", "admins"],
  },
  updatedAt: {
    type: Date,
    optional: true,
    canRead: ["owners", "admins"],
  },
  // unlike updatedAt, this tracks when the user clicked "submit" on the client,
  // not when the server finished the update
  lastSavedAt: {
    type: Date,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["owners", "admins"],
  },
  // tracks the most recent time the user reached the end of the survey
  finishedAt: {
    type: Date,
    optional: true,
    canRead: ["owners", "admins"],
  },
  /**
   * NOTE: this userId is only present in Response
   * It is removed in the NormalizedResponse that can be made public
   */
  userId: {
    type: String,
    optional: true,
    canRead: ["members"],
    relation: {
      fieldName: "user",
      typeName: "User",
      kind: "hasOne",
    },
  },

  // custom properties

  year: {
    type: Number,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["admins"],
    canUpdate: ["admins"],
  },
  duration: {
    type: Number,
    optional: true,
    canRead: ["owners"],
  },
  completion: {
    type: Number,
    optional: true,
    canRead: ["owners", "admins"],
  },
  knowledgeScore: {
    type: Number,
    optional: true,
    canRead: ["owners", "admins"],
  },
  locale: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
  },
  isSynced: {
    type: Boolean,
    optional: true,
    canRead: ["admins"],
  },
  emailHash: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  isSubscribed: {
    type: Boolean,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  context: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  surveySlug: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
    options: surveys.map(({ slug }) => ({
      value: slug,
      label: slug,
    })),
  },
  isNormalized: {
    type: Boolean,
    optional: true,
    canRead: ["admins"],
    canCreate: ["admins"],
    canUpdate: ["admins"],
  },
  /*
  NOTE: this field will exist in the database, but is only used in the admin area
  Currently (09/2022) the admin area doesn't use this field but instead rely on a virtual field with a
  "reversed relation" to get the normalizedResponse from a response
  However the normalization adds this field in the db for convenience of future changes
  normalizedResponseId: {
    type: String,
    optional: true,
    canRead: ["admins"],
    canCreate: ["admins"],
    canUpdate: ["admins"],
  },
  */
  isFinished: {
    type: Boolean,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["members"],
  },
  common__user_info__authmode: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__device: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__browser: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__version: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__os: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__referrer: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  common__user_info__source: {
    type: String,
    optional: true,
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ["admins"],
  },
  // surveyId: {
  //   type: String,
  //   canRead: ['guests'],
  //   canCreate: ['members'],
  //   canUpdate: ['admins'],
  //   input: 'select',
  //   relation: {
  //     fieldName: 'survey',
  //     typeName: 'Survey',
  //     kind: 'hasOne',
  //   },
  //   options: ({ data }) =>
  //     get(data, 'surveys.results', []).map(survey => ({
  //       value: survey._id,
  //       label: `[${survey.year}] ${survey.name}`,
  //     })),
  //   query: `
  //   query SurveysQuery {
  //     surveys{
  //       results{
  //         _id
  //         name
  //         year
  //       }
  //     }
  //   }
  //   `,
  // },
};

/**
 *
 *
 * Just put all questions for all surveys on the root of the schema
 */
// let i = 0;
/**
 * Have one schema per survey
 */
export const schemaPerSurvey: { [slug: string]: VulcanGraphqlSchema } = {};

export const getCommentSchema = () => ({
  type: String,
  input: "hidden",
  optional: true,
  canRead: ["owners", "admins"],
  canCreate: ["members"],
  canUpdate: ["owners", "admins"],
});

const coreSchema = cloneDeep(schema) as VulcanGraphqlSchema;
surveys.forEach((survey) => {
  if (survey.slug) {
    schemaPerSurvey[survey.slug] = cloneDeep(coreSchema);
  }
  survey.outline.forEach((section) => {
    section.questions &&
      section.questions.forEach((questionOrId) => {
        //i++;
        if (Array.isArray(questionOrId)) {
          // NOTE: from the typings, it seems that questions can be arrays? To be confirmed
          throw new Error("Found an array of questions");
        }
        let questionObject = getQuestionObject(questionOrId, section);
        // questionObject = addComponentToQuestionObject(questionObject);
        const questionSchema = getQuestionSchema(
          questionObject,
          section,
          survey
        );

        const questionId = getQuestionId(survey, section, questionObject);
        schema[questionId] = questionSchema;
        if (survey.slug) {
          schemaPerSurvey[survey.slug][questionId] = questionSchema;
        }

        if (questionObject.suffix === "experience") {
          // const commentSchema = addComponentToQuestionObject(
          //   getCommentSchema()
          // ) as VulcanFieldSchema<any>;
          const commentSchema = getCommentSchema() as VulcanFieldSchema<any>;
          const commentQuestionId = getQuestionId(survey, section, {
            ...questionObject,
            suffix: "comment",
          });
          schema[commentQuestionId] = commentSchema;
          if (survey.slug) {
            schemaPerSurvey[survey.slug][commentQuestionId] = commentSchema;
          }
        }
      });
  });
});

export default schema;
