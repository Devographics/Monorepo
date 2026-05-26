/**
 * Verify the magic link token
 */

import passport from "passport";
import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";

import { magicLinkStrategy } from "~/lib/account/magicLogin/api/passport/magic-login-strategy";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";
import { setToken } from "~/lib/account/middlewares/setToken";
import { AuthenticatedNextApiRequest } from "~/lib/account/magicLogin/typings/requests-body";

/**
 * @see https://vercel.com/docs/functions/serverless-functions/runtimes#maxduration
 * On PRO offer we are allowed for 300s execution max
 * (default is 10s so too short for loading all locales)
 */
export const maxDuration = 300;

export const config = {
  maxDuration: 300,
};

passport.use(magicLinkStrategy);

type NextHandler = (err?: unknown) => void;

interface MagicLoginReqBody {
  token: string;
}

interface TokenAuthenticatedNextApiRequest extends AuthenticatedNextApiRequest {
  body: MagicLoginReqBody;
}

const router = createRouter<
  TokenAuthenticatedNextApiRequest,
  NextApiResponse
>();

router.use(
  passport.initialize() as unknown as (
    req: TokenAuthenticatedNextApiRequest,
    res: NextApiResponse,
    next: (err?: unknown) => void,
  ) => void,
);

router.get(
  connectToAppDbMiddleware,

  passport.authenticate("magiclogin", {
    // prevent passport from managing session on its own
    // @see https://stackoverflow.com/questions/19948816/passport-js-error-failed-to-serialize-user-into-session
    session: false,
  }),

  async (
    req: TokenAuthenticatedNextApiRequest,
    res: NextApiResponse,
    next: NextHandler,
  ) => {
    const user = req.user;

    if (!user) {
      return res
        .status(500)
        .send("Magic login succeeded but req.user not correctly set.");
    }

    return next();
  },

  setToken,

  (req: TokenAuthenticatedNextApiRequest, res: NextApiResponse) => {
    return res.status(200).send({
      done: true,
      userId: req.user?._id,
    });
  },
);

export default router.handler();
