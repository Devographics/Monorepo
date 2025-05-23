/**
 * TODO: we can enable/disable anonymous login via a middleware
 * /!\ at the time of writing (05/2022) you cannot change env values
 * for middlewares on the fly, so disabling anon auth requires a rebuild
 */

/**
 * Verify the magic link token
 */
import passport from "passport";
import nextConnect from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";

import { anonymousLoginStrategy } from "~/lib/account/anonymousLogin/api/passport/anonymous-strategy";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";
import { setToken } from "~/lib/account/middlewares/setToken";
import { createResponse } from "~/lib/responses/db-actions/create";

passport.use(anonymousLoginStrategy);

interface AnonymousLoginReqBody {}
// NOTE: adding NextApiRequest, NextApiResponse is required to get the right typings in next-connect
// this is the normal behaviour
// @ts-ignore TODO Eric
const loginAndCreateResponse = nextConnect<NextApiRequest, NextApiResponse>()
  // @ts-ignore
  .use(passport.initialize())
  .post(
    connectToAppDbMiddleware,
    passport.authenticate(
      "anonymouslogin",
      // prevent passport from managing session on its own
      // @see https://stackoverflow.com/questions/19948816/passport-js-error-failed-to-serialize-user-into-session
      { session: false }
    ),
    async (req, res, next) => {
      const user = (req as unknown as any).user;
      if (!user) {
        return res
          .status(500)
          .send("Anonymous login succeeded but req.user not correctly set.");
      }
      return next();
    },
    setToken,
    async (req, res) => {
      const currentUser = (req as unknown as any).user;
      const clientData = req.body;
      const response = await createResponse({ clientData, currentUser });
      return res
        .status(200)
        .send({ done: true, userId: req.user._id, response });
    }
  );

export default loginAndCreateResponse;
