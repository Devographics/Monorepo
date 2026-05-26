/**
 * Trigger the magic link email
 */

import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";

import { magicLinkStrategy } from "~/lib/account/magicLogin/api/passport/magic-login-strategy";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";

// TODO: we already have a rate limiter in place for the IP address in middleware.ts
// but I keep this one around until we migrate to route handlers
// remove when migrating (and add an e2e test for rate limiting like we used to do)
import rateLimit from "express-rate-limit";

import { connectToRedisMiddleware } from "~/lib/server/redis";

import { MagicLoginSendEmailBody } from "~/lib/account/magicLogin/typings/requests-body";

type NextHandler = (err?: unknown) => void;

interface MagicLoginRequest extends NextApiRequest {
  body: MagicLoginSendEmailBody;
}

// check request validity
const checkBody = (
  req: MagicLoginRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  if (!req.body) {
    return res.status(400).send("Request body not defined");
  }

  if (!req.body.destination) {
    return res.status(400).send("No destination email found in request");
  }

  next();
};

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 request max for a key
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  // NOTE: as a default rateLimit will use the IP but this is not totally reliable
  // we can use the requested email here for this precise scenario
  keyGenerator: (request) => {
    //@ts-ignore
    return (request.body as MagicLoginSendEmailBody).destination;
  },
});

const router = createRouter<MagicLoginRequest, NextApiResponse>();

router.post(
  checkBody,
  //@ts-ignored
  limiter,
  connectToAppDbMiddleware,
  connectToRedisMiddleware,
  magicLinkStrategy.send,
);

export default router.handler();
