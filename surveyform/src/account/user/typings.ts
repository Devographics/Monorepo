import { ResponseDocument } from "@devographics/types";

/**
 * Temporary user data with unhashed email
 *
 * Must never be stored in the database, we must replace the email by a emailHash
 */
export type NewUserDocument = Omit<UserDocument, "emailHash"> & {
  email?: string;
};

export interface UserDocument {
  _id?: string;
  anonymousId?: string;
  anonymousIds?: string[];
  /**
   * For passwordless, false until the user clicked the magic link for the first time
   * TODO: verify spec for anon user: they should probably stay always unverified
   **/
  isVerified?: boolean;
  /**
   * TODO: is it still used?
   */
  meta?: {
    surveyId;
    editionId;
  };
}

// & (
//   | {
//       /**
//        * Legacy password based auth
//        */
//       authMode: undefined | "password";
//       emailHash: string;
//       emailHash2: string;
//     }
//   | { authMode: "anonymous"; emailHash?: undefined; emailHash2?: undefined }
//   | {
//       authMode: "passwordless";
//       emailHash: string;
//       emailHash2: string;
//     }
// );

export interface UserDocumentWithResponses extends UserDocument {
  responses: Pick<
    ResponseDocument,
    | "_id"
    | "userId"
    | "editionId"
    | "surveyId"
    | "updatedAt"
    | "createdAt"
    | "completion"
  >[];
}

/**
 * Minimal structure to authenticate via email
 */
export type EmailUser = {
  _id?: string;
  emailHash?: string;
  emailHash2?: string;
};
