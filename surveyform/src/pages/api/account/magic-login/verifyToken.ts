/**
 * Verify the magic link token
 */
import passport from "passport";
import nextConnect from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";

import { magicLinkStrategy } from "~/lib/account/magicLogin/api/passport/magic-login-strategy";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";
import { setToken } from "~/lib/account/middlewares/setToken";

passport.use(magicLinkStrategy);

interface MagicLoginReqBody {
  token: string;
}
// NOTE: adding NextApiRequest, NextApiResponse is required to get the right typings in next-connect
// this is the normal behaviour
// @ts-ignore TODO Eric
const login = nextConnect<NextApiRequest, NextApiResponse>()
  // @ts-ignore
  .use(passport.initialize())
  .get(
    connectToAppDbMiddleware,
    passport.authenticate(
      "magiclogin",
      // prevent passport from managing session on its own
      // @see https://stackoverflow.com/questions/19948816/passport-js-error-failed-to-serialize-user-into-session
      { session: false }
    ),
    async (req, res, next) => {
      const user = (req as unknown as any).user;
      if (!user) {
        return res
          .status(500)
          .send("Magic login succeeded but req.user not correctly set.");
      }
      return next();
    },
    setToken,
    (req, res) => {
      return res.status(200).send({ done: true, userId: req.user?._id });
    }
  );

export default login;
