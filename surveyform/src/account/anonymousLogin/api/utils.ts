import { UserDocument } from "~/account/user/typings";

export const generateAnonymousUser = (): UserDocument => {
  return {
    authMode: "anonymous",
    isVerified: false,
  };
};
