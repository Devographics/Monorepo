//import { Strategy as MagicLinkStrategy } from "passport-magic-link";
import MagicLoginStrategy from "passport-magic-login";
import { getTokenSecret } from "~/account/user/api/session";
import { sendMagicLinkEmail } from "../email/magicLinkEmail";

import { UserTypeServer } from "~/core/models/user.server";

import debug from "debug";
import { routes } from "~/lib/routes";
import { serverConfig } from "~/config/server";
import type { Request } from "express";
import { UserType } from "~/core/models/user";
import {
  createOrUpgradeUser,
  findUserFromEmail,
  updateUserEmailHash,
  upgradeUser,
} from "./userUtils";

/**
 * Compute the full magic link, with redirection parameter
 * @param req
 * @param href
 * @returns
 */
const computeMagicLink = (req: Request, href: string) => {
  const magicLinkUrl = new URL(`${serverConfig().appUrl}${href}`);
  const from = req.query?.from;
  if (from && typeof from === "string") {
    magicLinkUrl.searchParams.set("from", from);
  } else if (from) {
    console.warn("From parameter is not a string", req.query, req.url);
  }
  return magicLinkUrl.toString();
};
async function sendMagicLink(
  destination: string,

  /**  href = /callbackUrl?token=<the magic token> */
  href: string /*user, token: string*/,
  // the auth token
  code: string,
  // the request
  req: Request
) {
  const email = destination;
  // Important! otherwise we could send the email to a random user!
  if (!(email && typeof email === "string"))
    throw new Error("Cannot send magic link without a valid email");

  const magicLink = computeMagicLink(req, href);

  // If there is no user with this email, we create an unverified user
  // => this is particularly useful if anonymousId is set, this way we can remember the anonymousId/email link even if the user
  // did not click the magic link
  // => this could enable a "temporary authentication" mode for new users to reduce friction in the future (we have to assess security yet)
  const foundUser = await findUserFromEmail(email);

  const { anonymousId, surveyContextId, year, locale } = req.body;
  if (!foundUser) {
    const user: {
      email: string;
      anonymousId: string;
      isVerified: boolean;
      meta?: any;
    } = {
      email,
      anonymousId,
      // Important: the user is not verified until they have actually clicked the magic link
      isVerified: false,
    };

    if (surveyContextId || year) {
      user.meta = {
        surveyContextId,
        // @deprecated
        surveySlug: surveyContextId.replaceAll("_", "-"),
        // TODO: find the surveyEditionId instead if possible
        surveyYear: year,
      };
    }
    await createOrUpgradeUser(user);
  } else {
    await updateUserEmailHash(foundUser, email);

    // add anonymous id if necessary (BUT DO NOT VERIFY)
    await upgradeUser({
      foundUser: foundUser as UserType,
      anonymousId,
      makeVerified: false,
    });
  }

  //console.log("send to", email);
  return sendMagicLinkEmail({
    email,
    // href = /callbackUrl?token=<the magic token>
    magicLink,
    surveyContextId,
    locale,
  });
  /*
      return MailService.sendMail({
        to: user.email,
        token,
      });
      */
}

/**
 * Find the user and create it if it doesn't exist yet
 * In passwordless auth, there is no need for a signup step, since
 * the user is automatically verified thanks to the email workflow
 * So we create it in the db if it doesn't exist yet during first login
 * @param param0
 */
async function verify(
  payload: {
    destination: string;
    anonymousId?: string;
  },
  cb /*{ email }: Pick<UserTypeServer, "email">*/
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
      await updateUserEmailHash(foundUser, email);

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
  sendMagicLink,
  verify,
});
