import { getRawResponsesCollection } from "@devographics/mongo";
import { EditionMetadata } from "@devographics/types";
import { cache } from "react";

export const rscTotalResponses = cache(
  async ({ edition }: { edition: EditionMetadata }) => {
    const Responses = await getRawResponsesCollection();

    const selector = { editionId: edition.id, completion: { $gte: 1 } };

    const validResponsesCount = await Responses.countDocuments(selector);

    return validResponsesCount;
  }
);
