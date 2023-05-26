import { getRawResponsesCollection } from "@devographics/mongo";
import { ResponseDocument } from "@devographics/types";
import { notFound } from "next/navigation";
import { cache } from "react";
import { UserDocument } from "~/account/user/typings";
import { rscMustGetSurveyEdition } from "~/app/[lang]/survey/[slug]/[year]/rsc-fetchers";

/**
 * Get user response for a survey
 * Possible because we expect only one response per edition
 */
export const rscMustGetUserResponse = cache(
    async ({ currentUser, slug, year }: { currentUser: UserDocument, slug: string, year: string }) => {
        const edition = await rscMustGetSurveyEdition({ slug, year })
        // TODO: get user response directly here, so we don't need the responseId anymore
        const Responses = await getRawResponsesCollection<ResponseDocument>();
        const selector = {
            userId: currentUser._id,
            editionId: edition.id
        };
        const responseFromDb = await Responses.findOne(selector);
        if (!responseFromDb) {
            return notFound();
        }
        if (responseFromDb.userId !== currentUser._id) {
            throw new Error("Response retrieved from server doesn't belong to current user");
        }
        // There is no field to omit in the response anymore
        const response = responseFromDb
        return response;
    }
);

/**
 * Get response from id
 */
export const rscMustGetResponse = cache(
    async ({ responseId, currentUser }: { responseId: string, currentUser: UserDocument }) => {
        const Responses = await getRawResponsesCollection<ResponseDocument>();
        const selector = {
            _id: responseId
        };
        const responseFromDb = await Responses.findOne(selector);
        if (!responseFromDb) {
            return notFound();
        }
        if (responseFromDb.userId !== currentUser._id) {
            throw new Error("Response retrieved from server doesn't belong to current user");
        }
        // Technically the responseId URL parameter is not really needed
        // since there is one response per survey
        if (responseFromDb._id !== responseId) {
            throw new Error("Mismatch between URL and user response")
        }
        // There is no field to omit in the response anymore
        const response = responseFromDb
        return response;
    }
)