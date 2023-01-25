/**
 * Parse a survey
 *
 * /!\ Template parsing is done separately, because it involves
 * JSX and should not be reused in scripts
 */
import pick from "lodash/pick.js";
import {
  Field,
  FieldTemplateId,
  ParsedQuestion,
  SurveySection,
  SurveyType,
} from "@devographics/core-models";
import surveys from "~/surveys";
import { statuses } from "~/surveys/constants";

//import { data } from "autoprefixer";
import { ResponseDocument } from "@devographics/core-models";
import { isAdmin } from "@vulcanjs/permissions";
import { VulcanGraphqlFieldSchema } from "@vulcanjs/graphql";
import SimpleSchema from "simpl-schema";
import {
  getQuestionId,
  getQuestionObject,
  parseSurvey,
} from "~/surveys/parser/parseSurvey";
import { captureException } from "@sentry/nextjs";
import { getSurveyFromResponse } from "~/surveys/getters";

// Previously it lived in Vulcan NPM, but that's something you'd want to control more
// precisely at app level
const additionalFieldKeys /*: keyof VulcanGraphqlFieldSchema*/ = [
  "hidden", // hidden: true means the field is never shown in a form no matter what
  "mustComplete", // mustComplete: true means the field is required to have a complete profile
  "form", // extra form properties
  "inputProperties", // extra form properties
  "itemProperties", // extra properties for the form row
  "input", // SmartForm control (String or React component)
  "control", // SmartForm control (String or React component) (legacy)
  "order", // position in the form
  "group", // form fieldset group
  "arrayItem", // properties for array items

  "onCreate", // field insert callback
  "onInsert", // field insert callback (OpenCRUD backwards compatibility)

  "onUpdate", // field edit callback
  "onEdit", // field edit callback (OpenCRUD backwards compatibility)

  "onDelete", // field remove callback
  "onRemove", // field remove callback (OpenCRUD backwards compatibility)

  "canRead", // who can view the field
  "viewableBy", // who can view the field (OpenCRUD backwards compatibility)

  "canCreate", // who can insert the field
  "insertableBy", // who can insert the field (OpenCRUD backwards compatibility)

  "canUpdate", // who can edit the field
  "editableBy", // who can edit the field (OpenCRUD backwards compatibility)

  "typeName", // the type to resolve the field with
  "resolveAs", // field-level resolver
  "searchable", // whether a field is searchable
  "description", // description/help
  "beforeComponent", // before form component
  "afterComponent", // after form component
  "placeholder", // form field placeholder value
  "options", // form options
  "query", // field-specific data loading query
  "dynamicQuery", // field-specific data loading query
  "staticQuery", // field-specific data loading query
  "queryWaitsForValue", // whether the data loading query should wait for a field to have a value to run
  "autocompleteQuery", // query used to populate autocomplete
  "selectable", // field can be used as part of a selector when querying for data
  "unique", // field can be used as part of a selectorUnique when querying for data
  "orderable", // field can be used to order results when querying for data (backwards-compatibility)
  "sortable", // field can be used to order results when querying for data

  "apiOnly", // field should not be inserted in database
  "relation", // define a relation to another model

  "intl", // set to `true` to make a field international
  "isIntlData", // marker for the actual schema fields that hold intl strings
  "intlId", // set an explicit i18n key for a field
];

SimpleSchema.extendOptions(additionalFieldKeys);

/*

Replace all occurences of a string

*/
// eslint-disable-next-line no-extend-native
// TODO: drop this old code
(String.prototype as any).replaceAll = function (search, replacement) {
  const target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};

/*

Take a string ("Front-end") and make it usable as an ID ("frontend")

*/
const disallowedCharacters = "?.(){}[]=>&,/- @*";
export const makeId = (str) => {
  if (!str) {
    return "";
  }
  let s = str.toLowerCase();
  const charArray = [...disallowedCharacters];
  charArray.forEach((c) => {
    s = s.replaceAll(`\\${c}`, "");
  });
  return s;
};

export const parseOptions = (questionObject, options) => {
  const { optionsIntlId } = questionObject;
  return options.map((option) => {
    if (typeof option === "object") {
      // if option is an object, use its id or value as translation key
      const { id, value } = option;
      const idString = typeof id !== "undefined" ? String(id) : String(value);
      return {
        value: id,
        label: idString, // only used as fallback
        intlId: optionsIntlId
          ? `${optionsIntlId}.${idString}`
          : `options.${questionObject.id}.${idString}`,
        ...option,
      };
    } else {
      // if option is a string, use it as is
      return { value: option, label: option };
    }
  });
};

export const generateIntlId = (questionObject, section, survey) => {
  const { sectionSlug, id, intlId, intlPrefix, suffix } = questionObject;
  // if intlId is explicitely specified on question object use that
  if (intlId) {
    return intlId;
  }
  // survey contexts are not currently supported
  // const surveySegment = survey.context;
  const surveySegment = "";
  // for section segment, use either intlPrefix, section slug or sectionSlug override on question
  const sectionSegment =
    intlPrefix || sectionSlug || section.slug || section.id;
  const questionSegment = `.${String(id)}`;
  // for now hardcode "others" and "prenormalized" as the only valid suffixes
  const suffixSegment =
    suffix && (suffix === "others" || suffix === "prenormalized")
      ? ".others"
      : "";
  return [surveySegment, sectionSegment, questionSegment, suffixSegment].join(
    ""
  );
};

// transform question object into SimpleSchema-compatible schema field
export const getQuestionSchema = (
  questionObject: ParsedQuestion,
  section,
  survey: SurveyType
): VulcanGraphqlFieldSchema => {
  const {
    id,
    title,
    options,
    allowmultiple = false,
    alias,
    year,
    limit,
    arrayItem,
    itemProperties,
  } = questionObject;

  const intlId = generateIntlId(questionObject, section, survey);

  const fieldKeys = [
    "type",
    "description",
    "input",
    "searchable",
    ...additionalFieldKeys,
  ];

  const questionSchema = {
    ...pick(questionObject, fieldKeys),
    // label: title,
    label: alias || title,
    intlId,
    optional: true,
    // canRead: isprivate ? ['owners'] : ['members'],
    canRead: ["owners", "admins"], // note: for now data is not public so all fields can be set to ['owners']
    canCreate: ["members"],
    canUpdate: ["owners", "admins"],
    itemProperties: {
      ...itemProperties,
      questionId: id,
      year,
      limit,
    },
  };

  if (options && Array.isArray(options)) {
    questionSchema.options = parseOptions(questionObject, options);
  }

  if (allowmultiple) {
    questionSchema.type = Array;
    questionSchema.arrayItem = {
      type: String,
      optional: true,
    };
  }

  // @ts-ignore
  return questionSchema;
};

/**
 * Fields that do not count in the completion percentage or knowledge score
 */
export const ignoredFieldTypes: Array<FieldTemplateId> = [
  "email",
  "email2",
  "receive_notifications",
  "help",
  "others",
  "project",
];

export const getCompletionPercentage = (response: ResponseDocument) => {
  let completedCount = 0;
  let totalCount = 0;
  const survey = getSurveyFromResponse(response);
  if (!survey) {
    return
  }
  const parsedOutline = parseSurvey(survey).outline;
  parsedOutline.forEach((section) => {
    section.questions &&
      section.questions.forEach((question) => {
        if (Array.isArray(question))
          throw new Error("Question cannot be an array");
        const questionId = getQuestionId(survey, section, question);
        const answer = response[questionId];
        const ignoreQuestion =
          question.template && ignoredFieldTypes.includes(question.template);
        if (!ignoreQuestion) {
          totalCount++;
          if (answer !== null && typeof answer !== "undefined") {
            completedCount++;
          }
        }
      });
  });
  const completion = Math.round((completedCount * 100) / totalCount);
  return completion;
};

export const surveyFromResponse = (response: ResponseDocument) => {
  const survey = surveys.find((s) => s.slug === response.surveySlug);
  if (!survey)
    throw new Error(
      `Survery with slug ${response.surverySlug} not found for response of _id ${response._id}`
    );
  return survey;
};

/**
 * Completion percentage of a section
 * @param section
 * @param response
 * @returns null if completion cannot be computed (no fillable question), the completion percentage
 * from 0 to 100 otherwise
 */
export const getSectionCompletionPercentage = (
  section: SurveySection,
  response?: ResponseDocument
) => {
  if (!response || !section.questions) {
    return null;
  }
  // don't count text questions towards completion score
  // TODO: we may have array of fields in a question yet it doesn't seem supported
  const completableQuestions = section.questions.filter((question) => {
    if (Array.isArray(question)) {
      console.warn("Found array question", section, question);
      return false;
    }
    const questionObject = getQuestionObject(question, section);
    // NOTE: if question has no template it's a valid one, it will use the default radiogroup input
    const isValidTemplate =
      !questionObject.template ||
      !ignoredFieldTypes.includes(questionObject.template);
    const isCompletable = !!(isValidTemplate && questionObject.fieldName);
    return isCompletable;
  }) as Array<Field & Required<Pick<Field, "fieldName">>>;
  const questionsCount = completableQuestions.length;
  if (!questionsCount) return null;

  const completedQuestions = completableQuestions.filter((question) => {
    const questionObject = getQuestionObject(question, section) as Required<
      Pick<Field, "fieldName">
    >;
    const { fieldName } = questionObject;
    const isCompleted =
      response[fieldName] !== null &&
      typeof response[fieldName] !== "undefined";
    return isCompleted;
  });

  const completedQuestionsCount = completedQuestions.length;
  return Math.round((completedQuestionsCount / questionsCount) * 100);
};
/*

Calculate CSS features knowledge score

*/
export const getKnowledgeScore = (response: ResponseDocument) => {
  const survey = surveyFromResponse(response);
  const featureSections = survey.outline.filter(
    (section) => section.slug === "features"
  );
  const featureFields = featureSections
    .map((s) => s.questions)
    // NOTE: the cast is mandatory here because typing of flat
    // is not ideal
    .flat() as Array<Field>;
  const unknownFields = featureFields.filter((field) => {
    //TODO: fields in "Response" probably have a slightly different type than fields in "Survey" (more attributes?)
    if (!field.fieldName) throw new Error(`Field without fieldName`);
    const value = response[field.fieldName];
    return value !== "heard" && value !== "used";
  });
  const total = featureFields.length;
  const unknown = unknownFields.length;
  const known = total - unknown;
  return {
    total,
    unknown,
    known,
    score: Math.round((known * 100) / total),
    unknownFields,
  };
};

export const canModifyResponse = (response, user) => {
  if (!response || !user) {
    return false;
  }
  const survey = surveyFromResponse(response);

  // admins can modify any survey; users can modify their own surveys
  const isAdminOrOwner = isAdmin(user) || user._id === response.userId;

  switch (survey.status) {
    case statuses.preview:
      return isAdminOrOwner;
    case statuses.open:
      return isAdminOrOwner;
    case statuses.closed:
      // nobody can modify closed survey
      return false;
    case statuses.hidden:
      return isAdminOrOwner;
    default:
      throw new Error(`Unknown survery status ${survey.status}`);
  }
};
