import { NextRequest } from "next/server";
import passport from "passport";
import { nespresso } from "../../nespresso";
import { RouteHandlerOptions } from "../../typings";

export async function POST(
  req: NextRequest,
  { params }: RouteHandlerOptions<{ responseId: string }>
) {
  throw new Error("NOT YET IMPLEMENTED");
  return nespresso(
    // @ts-ignore
    passport.initialize(),
    passport.authenticate(
      "anonymouslogin",
      // prevent passport from managing session on its own
      // @see https://stackoverflow.com/questions/19948816/passport-js-error-failed-to-serialize-user-into-session
      { session: false }
    ),
    async (req, res, next) => {
      // TODO: somehow "req.user" is not set...
      const user = (req as unknown as any).user;
      if (!user) {
        return (
          res
            // @ts-ignore
            .status(500)
            .send("Anonymous login succeeded but req.user not correctly set.")
        );
      }
      return next();
    },
    (req, res, next) => {
      // @ts-ignore
      res.send("hello");
      console.log("after send");
    }
  )(req);
}
