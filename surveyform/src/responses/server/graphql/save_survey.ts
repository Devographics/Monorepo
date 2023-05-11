import { processEmailOnUpdate } from "~/responses/model.server";
import { getEditionResponseSchema } from "~/responses/schema.server";
import { canModifyResponse } from "../model";
import { throwError } from "./errors";
import { fetchEditionMetadataSurveyForm } from "@devographics/fetch";
import { getRawResponsesCollection } from "@devographics/mongo";

/**
 * Save a survey response
 * @param root
 * @param args
 * @param context
 * @returns
 */
export const saveSurvey = async (root, args, context) => {
  const { currentUser } = context;
  let data = args?.input?.data;
  const _id = args.input.id;
  const Responses = await getRawResponsesCollection();

  // fetch document from db
  const response = await Responses.findOne({ _id });
  // run permission check
  if (!response || response?.userId !== currentUser._id) {
    throwError({
      id: "app.validation_error",
      data: {
        break: true,
        errors: [
          {
            break: true,
            id: "error.not_allowed",
            message: "Sorry, you are not allowed to modify this document.",
            properties: { responseId: data._id },
          },
        ],
      },
    });
  }

  if (!response) throw new Error("TS"); // just to please ts because throwError already has never return type

  const { surveyId, editionId } = response;

  // do not allow to edit closed survey
  // (this replace canUpdate logic from vulcan that needs to be async here)
  const can = await canModifyResponse(response, currentUser);
  if (!can)
    throwError({
      id: "app.validation_error",
      data: {
        break: true,
        errors: [
          {
            break: true,
            id: "error.not_allowed",
            message: "Sorry, you are not allowed to modify this document.",
            properties: { responseId: data._id },
          },
        ],
      },
    });

  const edition = await fetchEditionMetadataSurveyForm({
    surveyId,
    editionId,
    calledFrom: "saveSurvey",
  });
  // @ts-ignore
  const schema = getEditionResponseSchema(edition);

  // run all onUpdate callbacks
  for (const fieldName of Object.keys(schema)) {
    const field = schema[fieldName];
    const { onUpdate } = field;
    if (onUpdate) {
      data[fieldName] = await onUpdate({
        currentUser,
        document: response,
        data,
        context,
      });
    }
  }

  data = await processEmailOnUpdate(data, { document: response });

  // insert document
  const updatedDocument = await Responses.findOneAndUpdate(
    { _id },
    { $set: data },
    { returnDocument: "after" }
  );

  const mergedDocument = { ...updatedDocument.value, ...data };
  return { data: mergedDocument };
};
