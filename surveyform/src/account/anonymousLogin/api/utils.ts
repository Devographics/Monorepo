import { UserDocument } from "~/core/models/user";

export const generateAnonymousUser =
  (): UserDocument /*AnonymousUserDocument*/ => {
    return {
      groups: [],
      isAdmin: false,
      authMode: "anonymous",
      isVerified: false,
    };
  };
