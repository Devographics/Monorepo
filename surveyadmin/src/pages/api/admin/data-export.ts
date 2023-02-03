import type { NextApiRequest, NextApiResponse } from "next";

import nextConnect from "next-connect";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";
import { contextFromReq } from "~/lib/server/context";
import { mongoExportMiddleware } from "~/admin/server/api/mongoExport";

export default apiWrapper(
  nextConnect<NextApiRequest, NextApiResponse>({
    onError: (err, req, res, next) => {
      console.error(err.stack);
      res.status(500).end("Unknown error");
    },
  }).get(
    connectToAppDbMiddleware,
    async function checkAuth(req, res: NextApiResponse, next) {
      // Same context is in graphql API
      const context = await contextFromReq(req);
      if (!context.currentUser?.isAdmin) {
        return res.status(401).end("Not authenticated as admin");
      }
      next();
    },
    mongoExportMiddleware
  )
);
