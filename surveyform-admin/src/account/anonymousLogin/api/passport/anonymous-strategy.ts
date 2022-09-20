import { createMutator } from "@vulcanjs/crud/server";
import type { Request } from "express";
import { StrategyCreatedStatic } from "passport";
import { Strategy } from "passport";
import { generateAnonymousUser } from "~/account/anonymousLogin/api";
import { User } from "~/core/models/user.server";

interface AnonymousLoginOptions {
  createUser: (req: Request) => Promise<any>;
  /**
   * Return true if user is a spammer
   */
  checkSpam?: (req: Request) => Promise<boolean>;
}

/**
 * Inspired by magic login
 * @see https://github.com/mxstbr/passport-magic-login/blob/master/src/index.ts
 *
 */
class AnonymousLoginStrategy /* extends Strategy*/ {
  name: string = "anonymouslogin";
  constructor(private _options: AnonymousLoginOptions) {}

  authenticate(
    this: StrategyCreatedStatic & AnonymousLoginStrategy,
    req: Request
  ): void {
    const self = this;
    console.log("self");

    return (self._options.checkSpam?.(req) || Promise.resolve(false))
      .then((isSpammer) => {
        if (isSpammer) {
          const info = "Detected as spammer";
          return self.fail(info);
        } else {
          return self._options
            .createUser()
            .then((user) => {
              return self.success(user /*, info*/);
            })
            .catch((err) => {
              const info = "User creation failed";
              return self.error(err, info);
            });
        }
      })
      .catch((err) => {
        const info = "Spam detection failed unexpectedly";
        return self.error(err, info);
      });

    // TODO: check security here like not having the same IP too many times etc.
    // and call self.fail

    /*
    const payload = decodeToken(
      self._options.secret,
      req.query.token as string
    );

    const verifyCallback = function (err?: Error, user?: Object, info?: any) {
      if (err) {
        return self.error(err);
      } else if (!user) {
        return self.fail(info);
      } else {
        return self.success(user, info);
      }
    };

    self._options.verify(payload, verifyCallback, req);
    */
  }
}

const createAnonymousUser = async () => {
  const data = generateAnonymousUser();
  // Create a new anonymous user in the db
  const { data: user } = await createMutator({
    model: User,
    data,
  });
  return user;
};

export const anonymousLoginStrategy = new AnonymousLoginStrategy({
  createUser: createAnonymousUser,
});
