import { getCollection } from "./utils";

export const getResponseCollection = () => getCollection("responses");
export const getUserCollection = () => getCollection("users");
export const getNormalizedResponseCollection = () =>
  getCollection("normalizedresponses");

export const getPrivateResponseCollection = () =>
  getCollection("privateresponses");
