import { UserDocument } from "~/account/user/typings";

export const generateAnonymousUser =
  (): UserDocument /*AnonymousUserDocument*/ => {
    return {
      groups: [],
      isAdmin: false,
      authMode: "anonymous",
      isVerified: false,
    };
  };
