/**
 * Verify the magic link token
 */
import passport from "passport";
import nextConnect from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import { apiWrapper } from "~/lib/server/sentry";

import { magicLinkStrategy } from "~/account/magicLogin/api/passport/magic-login-strategy";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";
import { setToken } from "~/account/middlewares/setToken";
import { getRawResponsesCollection } from "@devographics/mongo";
import { ResponseDocument } from "@devographics/types";
import { createResponse } from "~/lib/responses/db-actions/create";

passport.use(magicLinkStrategy);

interface MagicLoginReqBody {
  token: string;
}

interface VerifyTokenResponse {
  done: boolean;
  userId: string;
  editionId: string;
  surveyId: string;
  responseId: string;
  response: Pick<ResponseDocument, "_id">;
  responseType: "existing" | "new";
  // probably not useful here since we redirect to the response automatically
  redirectTo?: string;
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
    async (req, res) => {
      // note: the following refers to a survey response, not an Express response
      let response, responseType: "new" | "existing";
      // TODO: would be nice to use POST instead of GET here but passport
      // does not seem to accept POST?
      // const { clientData } = req.body;
      const { token, ...clientData } = req.query;
      if (!clientData) {
        throw new Error(
          `Could not find clientData, cannot create or find response while verifying token.`
        );
      }
      const { editionId, surveyId } = clientData;
      const currentUser = req.user;
      const userId = currentUser?._id;

      // if a specific edition is passed as body parameter,
      // 1. look for an existing response for this edition from this user
      const Responses = await getRawResponsesCollection();
      const existingResponse = await Responses.findOne(
        { editionId, userId },
        { projection: { _id: 1 } }
      );
      if (existingResponse) {
        response = existingResponse;
        responseType = "existing";
      } else {
        response = await createResponse({ clientData, currentUser });
        responseType = "new";
      }
      const result: VerifyTokenResponse = {
        done: true,
        userId,
        editionId,
        surveyId,
        response,
        responseId: response._id,
        responseType,
      };
      return res.status(200).send(result);
    }
  );

export default apiWrapper(login);
