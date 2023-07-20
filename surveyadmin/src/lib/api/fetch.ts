import { fetchEditionMetadata } from "@devographics/fetch";
import { getEditionMetadataQuery } from "./queries";

export const fetchEditionMetadataAdmin = async (options: Parameters<typeof fetchEditionMetadata>[0]) => {
  return await fetchEditionMetadata({
    ...options,
    getQuery: getEditionMetadataQuery,
  });
};
