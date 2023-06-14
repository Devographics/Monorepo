import cloneDeep from "lodash/cloneDeep.js";
import { encryptSession, setTokenCookie } from "~/account/user/api";
export const setToken = async (req, res, next) => {
  console.log("// setToken");
  // session is the payload to save in the token, it may contain basic info about the user
  const session = cloneDeep(req.user);
  // The token is a string with the encrypted session
  const token = await encryptSession(session);
  setTokenCookie(res, token);
  return next();
};
