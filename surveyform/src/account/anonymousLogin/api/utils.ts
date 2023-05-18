import { UserDocument } from "~/lib/users/model";

export const generateAnonymousUser =
  (): UserDocument /*AnonymousUserDocument*/ => {
    return {
      groups: [],
      isAdmin: false,
      authMode: "anonymous",
      isVerified: false,
    };
  };
