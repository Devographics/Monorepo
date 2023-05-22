import { UserDocument } from "~/account/user/typings";

export const generateAnonymousUser =
  (): UserDocument => {
    return {
      groups: [],
      isAdmin: false,
      authMode: "anonymous",
      isVerified: false,
    };
  };
