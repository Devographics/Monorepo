import { NextApiRequest, NextApiResponse } from "next";
import { removeTokenCookie } from "~/account/user/api";
import { apiWrapper } from "~/lib/server/sentry";

async function logout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    removeTokenCookie(res);
    res.end();
  }
}

export default apiWrapper(logout);
