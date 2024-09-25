import { getRawResponsesCollection } from "@devographics/mongo";
import { ResponseDocument } from "@devographics/types";
import { notFound } from "next/navigation";
import { cache } from "react";
import { UserDocument } from "~/lib/users/typings";
import { rscMustGetSurveyEditionFromUrl } from "~/app/[lang]/survey/[slug]/[year]/rsc-fetchers";
import { RscError } from "../rsc-error";

/**
 * Get user response for a survey
 * Possible because we expect only one response per edition
 *
 * Guarantees that the response belong to the passed user
 */
export const rscMustGetUserResponse = cache(
  async ({
    currentUser,
    slug,
    year,
  }: {
    currentUser: UserDocument;
    slug: string;
    year: string;
  }) => {
    const { data: edition } = await rscMustGetSurveyEditionFromUrl({
      slug,
      year,
    });
    // TODO: get user response directly here, so we don't need the responseId anymore
    const Responses = await getRawResponsesCollection();
    const selector = {
      userId: currentUser._id,
      editionId: edition.id,
    };
    const responseFromDb = await Responses.findOne(selector);
    if (!responseFromDb) {
      return notFound();
    }
    if (responseFromDb.userId !== currentUser._id) {
      throw new RscError({
        id: "response-non-matching-user-id",
        message:
          "Response retrieved from server doesn't belong to current user",
        status: 403,
      });
    }
    // There is no field to omit in the response anymore
    const response = responseFromDb;
    return response;
  }
);

/**
 * Get response from id
 *
 * Will throw:
 * - if response userId doesn't match currentUser id
 * - if response id doesn't match the provided responseId
 *  */
export const rscMustGetResponse = cache(
  async ({
    responseId,
    currentUser,
  }: {
    responseId: string;
    currentUser: UserDocument;
  }) => {
    const Responses = await getRawResponsesCollection();
    // get the response by id, than only check if it belong to current user
    // this helps having a clearer error message
    const selector = {
      _id: responseId,
    };
    const responseFromDb = await Responses.findOne(selector);
    if (!responseFromDb) {
      return notFound();
    }
    if (responseFromDb.userId !== currentUser._id) {
      throw new RscError({
        id: "response.permission",
        message: "You cannot access this response.",
        status: 400,
      });
    }
    // Technically the responseId URL parameter is not really needed
    // since there is one response per survey
    if (responseFromDb._id !== responseId) {
      throw new Error("Mismatch between URL and user response");
    }
    // There is no field to omit in the response anymore
    const response = responseFromDb;
    return response;
  }
);
