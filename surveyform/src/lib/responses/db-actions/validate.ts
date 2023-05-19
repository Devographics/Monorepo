import { ResponseDocument } from "@devographics/core-models";
import { EditionMetadata, SurveyMetadata, SurveyStatusEnum } from "@devographics/types";
import { ServerError } from "~/lib/server-error";
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
                throw new ServerError({
                    id: "update_not_authorized",
                    message: `User ${currentUser._id} not authorized to perform UPDATE on document ${existingResponse._id}`,
                    status: 400,
                });
            }
        } else {
            throw new ServerError({
                id: "no_existing_response",
                message: `Cannot validate UPDATE operation without an existing response`,
                status: 400,
            });
        }
    }

    // check that edition is open
    if (edition.status === SurveyStatusEnum.CLOSED) {
        throw new ServerError({
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
        throw new ServerError({
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
        throw new ServerError({
            id: "server_data_validation_error",
            message: `Encountered an error while validating server data during ${action}`,
            status: 400,
            error,
        });
    }
};