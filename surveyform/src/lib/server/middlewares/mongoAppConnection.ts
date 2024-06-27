
import { getAppClient } from "@devographics/mongo";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Force connecting to the mongo database
 * (not technically needed, but this way Mongo is connected the first time we retrieve a collection)
 */
export const connectToAppDbMiddleware = (req: NextApiRequest, res: NextApiResponse, next: any) => {
  // force connecting to the db early
  getAppClient()
    .then(() => {
      return next();
    })
    .catch((err) => {
      return res.status(500).send(err);
    });
};
