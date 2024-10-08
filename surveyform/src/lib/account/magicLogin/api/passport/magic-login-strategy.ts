import MagicLoginStrategy from "passport-magic-login";
import {
  apiGetSessionFromReq,
  getTokenSecret,
} from "~/lib/account/session";
import { sendMagicLinkEmail } from "../email/magicLinkEmail";

import { UserTypeServer } from "~/lib/users/model.server";

import { routes } from "~/lib/routes";
import { serverConfig } from "~/config/server";
import { UserDocument } from "~/lib/users/typings";
import type { NextApiRequest } from "next";
// TODO: perhaps pass those via an init function/closure to make the account package independant from user db actions
import { upgradeUser } from "~/lib/users/db-actions/upgrade";
import { createOrUpgradeUser } from "~/lib/users/db-actions/createOrUpgrade";
import { findUserFromEmail } from "~/lib/users/db-actions/findFromEmail";
import { MagicLoginSendEmailBody } from "../../typings/requests-body";

/**
 * Compute the full magic link, with redirection parameter
 *
 * TODO: use NextRequest not NextApiRequest to move out of route handlers
 *
 * @param req
 * @param href
 * @returns
 */

const checkAndSetParams = (url, params, req) => {
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value && typeof value === "string") {
      url.searchParams.set(key, value);
    } else if (value) {
      console.warn(`${key} parameter is not a string`, req?.query, req?.url);
    }
  });
};

const computeMagicLink = (req: NextApiRequest, href: string) => {
  const magicLinkUrl = new URL(`${serverConfig().appUrl}${href}`);
  const { redirectTo, editionId, surveyId } = req.body;
  checkAndSetParams(magicLinkUrl, { redirectTo, editionId, surveyId }, req);
  return magicLinkUrl.toString();
};

/**
 * Magic link will expire after a duration
 * 
 * It can be clicked multiple time within this timeframe, this is expected
 * @see https://github.com/mxstbr/passport-magic-login/issues/36
 */
async function sendMagicLink(
  destination: string,

  /**  href = /callbackUrl?token=<the magic token> */
  href: string /*user, token: string*/,
  // the auth token
  code: string,
  // the request
  req: NextApiRequest
) {
  const currentUser = await apiGetSessionFromReq(req);
  const anonymousId = currentUser?._id;
  const email = destination;
  // Important! otherwise we could send the email to a random user!
  if (!(email && typeof email === "string"))
    throw new Error("Cannot send magic link without a valid email");

  const magicLink = computeMagicLink(req, href);

  const foundUser = await findUserFromEmail(email);

  const { surveyId, editionId, locale } = req.body as MagicLoginSendEmailBody;
  if (foundUser) {
    // add anonymous id if necessary (BUT DO NOT VERIFY)
    await upgradeUser({
      foundUser: foundUser as UserDocument,
      anonymousId,
      makeVerified: false,
    });
  } else {
    // If there is no user with this email, we create an unverified user
    // => this is particularly useful if anonymousId is set, this way we can remember the anonymousId/email link even if the user
    // did not click the magic link
    // => this could enable a "temporary authentication" mode for new users to reduce friction in the future (we have to assess security yet)
    const user: {
      email: string;
      anonymousId?: string;
      isVerified: boolean;
    } = {
      email,
      anonymousId,
      // Important: the user is not verified until they have actually clicked the magic link
      isVerified: false,
    };
    await createOrUpgradeUser(user);
  }

  return sendMagicLinkEmail({
    email,
    magicLink,
    editionId,
    surveyId,
    locale,
  });
}

/**
 * Find the user and create it if it doesn't exist yet
 * In passwordless auth, there is no need for a signup step, since
 * the user is automatically verified thanks to the email workflow
 * So we create it in the db if it doesn't exist yet during first login
 * @param param0
 */
async function verify(
  /** request data sent from magic login form */
  payload: {
    destination: string;
    anonymousId?: string;
  },
  cb: any /*{ email }: Pick<UserTypeServer, "email">*/
) {
  try {
    if (!payload) throw new Error("Invalid token, cannot verify user");
    const { destination, anonymousId } = payload;
    /**
     *
     * IMPORTANT: the login strategy will check if the token is valid for you
     * but WON'T FAIL FOR YOU!
     * In this case, "destination" is undefined
     *
     * Possible scenarios:
     *
     * 1.1) log with email, first time:
     * no user in db with this email, we create a new user
     *
     * 1.2) log with email, first time, was already logged as anonymous:
     * no user in db with this email, 1 user with _id === anonymousId
     * We add "email" to this user and keep the anonymousId.
     *
     * 2.1) log with email, second time, no anonymousId:
     * 1 user in db with this email, no anonymous user
     * we log in the user and do nothing
     *
     * 2.2) log with email, second time, was already logged as anonymous:
     * 1 user in db with this email, 1 user in db with _id === anonymousId => CONFLICT
     * we keep the user with email in db, and add "anonymousId" to an array "anonymousIds"
     * /!\ we still need a step a posteriori to update relevant "userId" everyhere in the db,
     * to replace "anonymousId" by the new userId.
     *
     */
    const email = destination;

    // Important! do not run the findOne query on an empty email!
    if (!(email && typeof email === "string"))
      return cb(
        new Error("Invalid magic link or token, could not compute an email")
      );

    const foundUser = await findUserFromEmail(email);

    if (!foundUser) {
      const createdOrUpgradedUser = await createOrUpgradeUser({
        email,
        anonymousId,
      });
      return cb(null, createdOrUpgradedUser);
    } else {
      const upgradedUser = await upgradeUser({
        foundUser: foundUser as UserTypeServer,
        anonymousId,
        makeVerified: true,
      });
      return cb(undefined, upgradedUser);
    }
  } catch (err) {
    return cb(err);
  }
  /*
      return User.findOrCreate({ email: user.email, name: user.name });
      */
}

export const magicLinkStrategy = new MagicLoginStrategy({
  // TODO: is this the appropriate value?
  secret: getTokenSecret(),
  callbackUrl: routes.account.magicLogin.href,
  // For passport-magic-link old package
  // TODO: also get anonymousId from cookies
  //userFields: ["email"],
  //tokenField: magicTokenName,
  // Will be called with parameter "?token=<magic token>"
  // @ts-ignore
  sendMagicLink,
  verify,
  // Optional: options passed to the jwt.sign call (https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback)
  jwtOptions: {
    // will be passed to vercel/ms
    // @see https://github.com/vercel/ms
    expiresIn: "30min",
  }
});
