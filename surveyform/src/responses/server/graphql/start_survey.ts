import {
  duplicateCheck,
  ResponseMongoCollection,
} from "~/responses/model.server";
import { nanoid } from "nanoid";
import { throwError } from "./errors";
import { ResponseDocument } from "@devographics/core-models";
import { getEditionResponseSchema } from "~/responses/schema.server";
import { fetchEditionMetadata } from "@devographics/fetch";

/**
 * Create a new response for the survey
 * @param root
 * @param args
 * @param context
 * @returns
 */
export const startSurvey = async (root, args, context) => {
  const { currentUser } = context;
  const data = args?.input?.data;
  let document = data as ResponseDocument;

  if (!document.editionId)
    throw new Error("Cannot create a response without a editionId");
  const { editionId, surveyId } = document;
  const edition = await fetchEditionMetadata({ surveyId, editionId });

  // run duplicate responses check
  const validationErrors = await duplicateCheck([], { document, currentUser });
  if (validationErrors.length) {
    throwError({
      id: "app.validation_error",
      data: { break: true, errors: validationErrors },
    });
  }

  // add userId and _id
  document = {
    ...document,
    editionId,
    surveyId,
    userId: currentUser._id,
    // _id: ObjectID().valueOf(), // also works
    _id: nanoid(),
  };

  // run all onCreate callbacks
  const schema = getEditionResponseSchema(edition);
  for (const fieldName of Object.keys(schema)) {
    const field = schema[fieldName];
    const { onCreate } = field;
    if (onCreate) {
      document[fieldName] = await onCreate({
        currentUser,
        document,
        data: document,
        context,
      });
    }
  }

  // insert document
  const Responses = ResponseMongoCollection();
  const insertedDocument = await Responses.insertOne(document);
  return { data: document };
};
