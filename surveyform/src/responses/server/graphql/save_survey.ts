import {
  ResponseMongoCollection,
  processEmailOnUpdate,
} from "~/responses/model.server";
import { schema } from "~/responses/schema.server";
import { throwError } from "./errors";

export const saveSurvey = async (root, args, context) => {
  const { currentUser } = context;
  let data = args?.input?.data;
  const _id = args.input.id;
  const Responses = ResponseMongoCollection();

  // fetch document from db
  const document = await Responses.findOne({ _id });

  // run permission check
  if (document.userId !== currentUser._id) {
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

  // run all onUpdate callbacks
  for (const fieldName of Object.keys(schema)) {
    const field = schema[fieldName];
    const { onUpdate } = field;
    if (onUpdate) {
      data[fieldName] = await onUpdate({
        currentUser,
        document,
        data,
        context,
      });
    }
  }

  data = await processEmailOnUpdate(data, { document });

  // insert document
  const updatedDocument = await Responses.updateOne({ _id }, { $set: data });

  const mergedDocument = { ...document, ...data };
  return { data: mergedDocument };
};
