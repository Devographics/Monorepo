/**
 * Helpers for email/password based authentication and account management
 *
 * /!\ Those methods expects the connection with the database to be already established
 * - Either create a UserMongooseModel that guarantees that the connection is always established
 * - Or establish the connection before you run those function, using "connectoToAppDb()" helper
 */
import crypto from "crypto";
import { UserMongooseModel, UserTypeServer } from "~/core/models/user.server";

import passport from "passport";
/**
 * Generic authentication method, wraps passport with a promise
 *
 * For local authentication with password and email, see passwordAuth
 * @param method
 * @param req
 * @param res
 * @returns
 */
export const authenticate = (
  method: "local" | "magiclink",
  /** May vary depending on the strategy, check relevant doc */
  options: any,
  req,
  res
): Promise<any> =>
  new Promise((resolve, reject) => {
    passport.authenticate(
      method,
      options,
      (
        /** Technical error or wrong request, depending on the strategy */
        error,
        /** False if not logged in, the returned user otherwise */
        token,
        /** This will contain the problem info if the credentials were wrong
         * (for the magic strategy it happens if email is missing)
         */
        info
      ) => {
        /**
         * Magic link strategy will not throw an error if the mandatory
         * userFields are missing (namely the "email")  when sending a mail,
         * but instead will fail auth. This behaviour is confusin, but it means
         * that no error and token === false => error
         */
        if (error) {
          reject(error);
        } else if (token) {
          resolve(token);
        } else {
          // This seems to occurs when the request has an incorrect body, eg you are using "username" instead of "emails"
          reject(
            new Error(
              `Unexpected error during authentication: ${info?.message}`
            )
          );
        }
      }
    )(req, res);
  });

// For legacy password check
import bcrypt from "bcrypt";
import { findUserFromEmail } from "./userUtils";
/**
 * Check that the provided password is the user's password
 * @param user
 * @param passwordToTest
 * @returns
 */
export const checkPasswordForUser = (
  user: Pick<UserTypeServer, "hash" | "salt">,
  passwordToTest: string
): boolean => {
  /**
   * LEGACY HANDLING FOR METEOR DB
   */
  if (!(user.salt && user.hash)) {
    console.warn(
      `User ${user && JSON.stringify(user)
      } has no salt/hash. Coming from Meteor? Will try to use legacy Meteor password, until the user changes their password.`
    );
    const storedHashedPassword = (user as any)?.services?.password?.bcrypt;
    if (!storedHashedPassword)
      throw new Error("User has no Meteor password either.");
    /*
      @see https://willvincent.com/2018/08/09/replicating-meteors-password-hashing-implementation/
      It doesn't work, probably because the hashing alg may change (Meteor seems to use sha256)
    const split = storedHashedPassword.split("$");
    if (split.length < 3) throw new Error(`Password string not valid.`);
    const hashedPassword = split[3];
    user.salt = hashedPassword.slice(0, 22);
    user.hash = hashedPassword.slice(22);
    */
    // @ts-ignore
    const userInput = new crypto.Hash("sha256")
      .update(passwordToTest)
      .digest("hex");

    return bcrypt.compareSync(userInput, storedHashedPassword);
  }
  const hash = (crypto as any)
    .pbkdf2Sync(passwordToTest, user.salt, 1000, 64, "sha512")
    .toString("hex");
  const passwordsMatch = user.hash === hash;
  return passwordsMatch;
};
/**
 * Find an user during authentication
 * Return null if not found/password mismatch
 *
 * @deprecated Now we use magic link auth
 * If this is used again, please be careful that we now need an email has
 * @param param0
 */
export async function findUserByCredentials({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<UserTypeServer | null> {
  // Here you should lookup for the user in your DB and compare the password:
  //
  const user = await findUserFromEmail(email);

  // NOTE: we should NEVER differentiate the return type depending on whether the email is found or the password is mismatching
  // otherwise attacker could guess whether an user has an account or not in the application
  if (!user) {
    return null;
  }
  // const user = await DB.findUser(...)
  if (user.authMode && user.authMode !== "password") {
    throw new Error(
      "Cannot check password for user authenticated with passwordless"
    );
  }
  const passwordsMatch = checkPasswordForUser(user, password);
  if (!passwordsMatch) {
    return null;
  }
  return user;
}
