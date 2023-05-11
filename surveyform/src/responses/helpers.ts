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
  SurveyEdition,
} from "@devographics/core-models";

//import { data } from "autoprefixer";
import { ResponseDocument } from "@devographics/core-models";
import { VulcanGraphqlFieldSchema } from "@vulcanjs/graphql";
import SimpleSchema from "simpl-schema";
import {
  getQuestionObject,
  parseEdition,
  QuestionFormObject,
} from "~/surveys/parser/parseSurvey";
import { captureException } from "@sentry/nextjs";
import { EditionMetadata, SectionMetadata } from "@devographics/types";

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
  const { optionsIntlId, i18nNamespace = questionObject.id } = questionObject;
  const parsedOptions = options.map((option) => {
    if (typeof option === "object") {
      // if option is an object, use its id or value as translation key
      const { id, value } = option;
      const idString = typeof id !== "undefined" ? String(id) : String(value);
      return {
        value: id,
        label: idString, // only used as fallback
        intlId: optionsIntlId
          ? `${optionsIntlId}.${idString}`
          : `options.${i18nNamespace}.${idString}`,
        ...option,
      };
    } else {
      // if option is a string, use it as is
      return { value: option, label: option };
    }
  });

  return parsedOptions;
};

export const generateIntlId = ({
  question,
  section,
}: {
  question: QuestionFormObject;
  section: SectionMetadata;
}) => {
  const { id, intlId, template } = question;
  // if intlId is explicitely specified on question object use that
  if (intlId) {
    return intlId;
  }
  // survey contexts are not currently supported
  // const surveySegment = survey.context;
  // for section segment, use either intlPrefix, section slug or sectionSlug override on question
  const sectionSegment = section.id;
  const questionSegment = id;
  // for now hardcode "others" and "prenormalized" as the only valid suffixes
  const suffixSegment = ".others";
  const addSuffix = ["project", "others", "others_textarea"];
  const segments = addSuffix
    ? [sectionSegment, questionSegment, suffixSegment]
    : [sectionSegment, questionSegment];
  return segments.join(".");
};

// transform question object into SimpleSchema-compatible schema field
export const getQuestionSchema = ({
  questionObject,
  section,
}: {
  questionObject: QuestionFormObject;
  section: SectionMetadata;
}): VulcanGraphqlFieldSchema => {
  const {
    id,
    // title,
    options,
    allowMultiple = false,
    // alias,
    yearAdded,
    limit,
    arrayItem,
    // itemProperties,
  } = questionObject;

  const intlId = generateIntlId({ section, question: questionObject });

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
    // label: alias || title,
    label: questionObject.id,
    intlId,
    optional: true,
    // canRead: isprivate ? ['owners'] : ['members'],
    canRead: ["owners", "admins"], // note: for now data is not public so all fields can be set to ['owners']
    canCreate: ["members"],
    canUpdate: ["owners", "admins"],
    itemProperties: {
      questionObject,
      // ...itemProperties,
      questionId: id,
      year: yearAdded,
      limit,
    },
  };

  if (options && Array.isArray(options)) {
    questionSchema.options = parseOptions(questionObject, options);
  }

  if (allowMultiple) {
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
export const ignoredFieldTypes = [
  "email",
  "email2",
  "receive_notifications",
  "help",
  "others",
  "project",
];

export const getCompletionPercentage = ({
  response,
  edition,
}: {
  response: ResponseDocument;
  edition: EditionMetadata;
}) => {
  let completedCount = 0;
  let totalCount = 0;
  const parsedSections = parseEdition(edition).sections;
  parsedSections.forEach((section) => {
    section.questions &&
      section.questions.forEach((question) => {
        const questionObject = getQuestionObject({
          survey: edition.survey,
          edition,
          section,
          question,
        });
        const fieldName = questionObject.formPaths.response;
        if (fieldName) {
          const answer = response[fieldName];
          const ignoreQuestion =
            question.template && ignoredFieldTypes.includes(question.template);
          if (!ignoreQuestion) {
            totalCount++;
            if (answer !== null && typeof answer !== "undefined") {
              completedCount++;
            }
          }
        }
      });
  });
  const completion = Math.round((completedCount * 100) / totalCount);
  return completion;
};

/**
 * Completion percentage of a section
 * @param section
 * @param response
 * @returns null if completion cannot be computed (no fillable question), the completion percentage
 * from 0 to 100 otherwise
 */
export const getSectionCompletionPercentage = ({
  edition,
  section,
  response,
}: {
  edition: EditionMetadata;
  section: SectionMetadata;
  response?: ResponseDocument;
}) => {
  if (!response || !section.questions) {
    return null;
  }
  // don't count text questions towards completion score
  // TODO: we may have array of fields in a question yet it doesn't seem supported
  const completableQuestions = section.questions
    .map((question) =>
      getQuestionObject({ survey: edition.survey, edition, section, question })
    )
    .filter((questionObject) => {
      const fieldName = questionObject.formPaths?.response!;
      // NOTE: if question has no template it's a valid one, it will use the default radiogroup input
      const isValidTemplate =
        !questionObject.template ||
        !ignoredFieldTypes.includes(questionObject.template);
      const isCompletable = !!(isValidTemplate && fieldName);
      return isCompletable;
    });
  const questionsCount = completableQuestions.length;
  if (!questionsCount) return null;

  const completedQuestions = completableQuestions.filter((question) => {
    const questionObject = getQuestionObject({
      survey: edition.survey,
      edition,
      section,
      question,
    });
    const fieldName = questionObject.formPaths?.response!;
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
export const getKnowledgeScore = (
  response: ResponseDocument,
  edition: EditionMetadata
) => {
  const featureSections = edition.sections.filter(
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
