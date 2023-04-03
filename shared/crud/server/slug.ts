/**
 * NOTE: this could belong to its own package
 *
 *  It depends on connector to get data, but connector themselves
 * could also work in a REST context
 */

import { Connector } from "./connector";

/**
 * @summary Given a collection and a slug, returns the same or modified slug that's unique within the collection;
 * It's modified by appending a dash and an integer; eg: my-slug  =>  my-slug-1
 * @param {Object} collection
 * @param {string} slug
 * @param {string} [documentId] If you are generating a slug for an existing document, pass it's _id to
 * avoid the slug changing
 * @returns {string} The slug passed in the 2nd param, but may be
 */
export const getUnusedSlug = async function (
  connector: Connector,
  slug,
  documentId
) {
  // test if slug is already in use
  for (let index = 0; index <= Number.MAX_SAFE_INTEGER; index++) {
    const suffix = index ? "-" + index : "";
    const documentWithSlug = await connector.findOne({ slug: slug + suffix });
    if (
      !documentWithSlug ||
      (documentId && documentWithSlug._id === documentId)
    ) {
      return slug + suffix;
    }
  }
};
