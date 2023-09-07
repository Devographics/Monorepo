import { UserDocument } from "~/account/user/typings";

import { newMongoId } from "@devographics/mongo";

export const generateAnonymousUser =
  (): UserDocument /*AnonymousUserDocument*/ => {
    return {
      // maybe overwritten later on, but we generate a string _id here to guarantee we don't accidentaly use MongoId
      _id: newMongoId(),
      authMode: "anonymous",
      isVerified: false,
    };
  };
