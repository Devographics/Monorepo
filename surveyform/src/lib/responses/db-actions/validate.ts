import type { ResponseDocument } from "@devographics/types";
import {
  EditionMetadata,
  SurveyMetadata,
  SurveyStatusEnum,
} from "@devographics/types";
import { HandlerError } from "~/lib/handler-error";
import { ActionContexts, Actions, getZodSchema } from "~/lib/validation";
import { getResponseSchema } from "../schema";

export const validateResponse = ({
  currentUser,
  existingResponse,
  updatedResponse,
  clientData,
  serverData,
  survey,
  edition,
  action,
}: {
  currentUser: any;
  existingResponse?: ResponseDocument;
  updatedResponse?: ResponseDocument;
  clientData: ResponseDocument;
  serverData: ResponseDocument;
  survey: SurveyMetadata;
  edition: EditionMetadata;
  action: Actions;
}) => {
  // check that user can perform action
  if (action === Actions.UPDATE) {
    if (existingResponse) {
      if (existingResponse.userId !== currentUser._id) {
        throw new HandlerError({
          id: "update_not_authorized",
          message: `User ${currentUser._id} not authorized to perform UPDATE on document ${existingResponse._id}`,
          status: 400,
        });
      }
    } else {
      throw new HandlerError({
        id: "no_existing_response",
        message: `Cannot validate UPDATE operation without an existing response`,
        status: 400,
      });
    }
  }

  // check that edition is open
  if (edition.status === SurveyStatusEnum.CLOSED) {
    throw new HandlerError({
      id: "survey_closed",
      message: `Survey ${edition.id} is currently closed, operation failed`,
      status: 400,
    });
  }

  const schema = getResponseSchema({ survey, edition });
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

  // parse client data
  try {
    clientSchema.parse(clientData);
  } catch (error) {
    throw new HandlerError({
      id: "client_data_validation_error",
      message: `Encountered an error while validating client data during ${action}`,
      status: 400,
      error,
    });
  }

  // parse server data
  try {
    serverSchema.parse(serverData);
  } catch (error) {
    throw new HandlerError({
      id: "server_data_validation_error",
      message: `Encountered an error while validating server data during ${action}`,
      status: 400,
      error,
    });
  }
};
