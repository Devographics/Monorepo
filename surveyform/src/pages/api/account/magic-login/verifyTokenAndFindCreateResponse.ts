/**
 * Verify the magic link token
 */

import passport from "passport";
import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";

import { magicLinkStrategy } from "~/lib/account/magicLogin/api/passport/magic-login-strategy";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";
import { setToken } from "~/lib/account/middlewares/setToken";

import { getRawResponsesCollection } from "@devographics/mongo";
import type { ResponseDocument, PrefilledResponse } from "@devographics/types";
import { prefilledResponseSchema } from "@devographics/types";
import { createResponse } from "~/lib/responses/db-actions/create";
import z from "zod";
import { AuthenticatedNextApiRequest } from "~/lib/account/magicLogin/typings/requests-body";

/**
 * @see https://vercel.com/docs/functions/serverless-functions/runtimes#maxduration
 */
export const maxDuration = 300;
export const config = {
  maxDuration: 300,
};

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
  redirectTo?: string;
}

type NextHandler = (err?: unknown) => void;

interface QueryAuthenticatedNextApiRequest extends AuthenticatedNextApiRequest {
  query: {
    token?: string;
    editionId?: string;
    surveyId?: string;
    [key: string]: any;
  };
}

const expectedClientDataSchema = z.object({
  editionId: z.string(),
  surveyId: z.string(),
});

const router = createRouter<
  QueryAuthenticatedNextApiRequest,
  NextApiResponse
>();

router.use(
  passport.initialize() as unknown as (
    req: AuthenticatedNextApiRequest,
    res: NextApiResponse,
    next: (err?: unknown) => void,
  ) => void,
);

router.get(
  connectToAppDbMiddleware,

  passport.authenticate("magiclogin", {
    session: false,
  }),

  async (
    req: QueryAuthenticatedNextApiRequest,
    res: NextApiResponse,
    next: NextHandler,
  ) => {
    if (!req.user) {
      return res
        .status(500)
        .send("Magic login succeeded but req.user not correctly set.");
    }
    return next();
  },

  setToken,

  async (req: QueryAuthenticatedNextApiRequest, res: NextApiResponse) => {
    let response: any;
    let responseType: "new" | "existing";

    const { token, ...clientData } = req.query;

    if (!clientData) {
      throw new Error(
        "Could not find clientData, cannot create or find response while verifying token.",
      );
    }

    const parsedData = prefilledResponseSchema.safeParse(clientData);

    if (!parsedData.success) {
      return res.status(400).send("Invalid prefilled data");
    }

    const { editionId, surveyId } = parsedData.data;

    if (!(editionId && surveyId)) {
      return res.status(400).send("Invalid editionId or surveyId");
    }

    const prefilledResponse = clientData as unknown as PrefilledResponse;

    const currentUser = req.user!;
    const userId = currentUser._id;

    const Responses = await getRawResponsesCollection();

    const existingResponse = await Responses.findOne(
      { editionId, userId },
      { projection: { _id: 1 } },
    );

    if (existingResponse) {
      response = existingResponse;
      responseType = "existing";
    } else {
      response = await createResponse({
        clientData: prefilledResponse,
        currentUser,
      });
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
  },
);

export default router.handler();
