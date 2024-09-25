import { UserDocument } from "~/lib/users/typings";

export const generateAnonymousUser = (): UserDocument => {
  return {
    authMode: "anonymous",
    isVerified: false,
  };
};
