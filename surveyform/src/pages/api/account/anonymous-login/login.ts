/**
 * TODO: we can enable/disable anonymous login via a middleware
 * /!\ at the time of writing (05/2022) you cannot change env values
 * for middlewares on the fly, so disabling anon auth requires a rebuild
 */

/**
 * Verify the magic link token
 */

import passport from "passport";
import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";

import { anonymousLoginStrategy } from "~/lib/account/anonymousLogin/api/passport/anonymous-strategy";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";
import { setToken } from "~/lib/account/middlewares/setToken";

passport.use(anonymousLoginStrategy);

type NextHandler = (err?: unknown) => void;

interface AuthenticatedNextApiRequest extends NextApiRequest {
  user?: {
    _id: string;
    [key: string]: unknown;
  };
}

const router = createRouter<AuthenticatedNextApiRequest, NextApiResponse>();

router.use(passport.initialize());

router.post(
  // TODO: probably not needed
  connectToAppDbMiddleware,

  passport.authenticate("anonymouslogin", {
    // prevent passport from managing session on its own
    // @see https://stackoverflow.com/questions/19948816/passport-js-error-failed-to-serialize-user-into-session
    session: false,
  }),

  async (
    req: AuthenticatedNextApiRequest,
    res: NextApiResponse,
    next: NextHandler,
  ) => {
    const user = req.user;

    if (!user) {
      return res
        .status(500)
        .send("Anonymous login succeeded but req.user not correctly set.");
    }

    return next();
  },

  setToken,

  (req: AuthenticatedNextApiRequest, res: NextApiResponse) => {
    return res.status(200).send({
      done: true,
      userId: req.user?._id,
    });
  },
);

export default router.handler();
