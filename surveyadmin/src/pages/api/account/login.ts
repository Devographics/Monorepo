import passport from "passport";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";

import { localStrategy } from "~/account/passwordLogin/api/passport/password-local";
import { authenticate } from "~/account/passwordLogin/api";
import { setToken } from "~/pages/api/account/middlewares/setToken";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";

passport.use(localStrategy);

const authenticateWithPassword = async (req, res) => {
  return authenticate("local", { session: false }, req, res);
};

interface LoginReqBody {
  email: string; // /!\  should match the "usernameField" of passport local strategy setup (default is "username")
  password: string;
}
// NOTE: adding NextApiRequest, NextApiResponse is required to get the right typings in next-connect
// this is the normal behaviour
const login = nextConnect<NextApiRequest, NextApiResponse>()
  .use(passport.initialize())
  .post(
    connectToAppDbMiddleware,
    async (req, res, next) => {
      try {
        const user = await authenticateWithPassword(req, res);
        req.user = user;
        next();
      } catch (error) {
        console.error(error);
        res.status(401).send(error.message);
      }
    },
    setToken,
    (req, res, next) => {
      return res.status(200).send({ done: true });
    }
  );

export default login
