import { fetchEditionMetadata } from "@devographics/fetch";
import { getEditionMetadataQuery } from "./queries";

export const fetchEditionMetadataAdmin = async (options) => {
  return await fetchEditionMetadata({
    ...options,
    getQuery: getEditionMetadataQuery,
  });
};
