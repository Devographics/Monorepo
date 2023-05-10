
import { getAppClient } from "@devographics/mongo";

/**
 * Force connecting to the mongo database
 * (not technically needed, but this way Mongo is connected the first time we retrieve a collection)
 */
export const connectToAppDbMiddleware = (req, res, next) => {
  // force connecting to the db early
  getAppClient()
    .then(() => {
      return next();
    })
    .catch((err) => {
      return res.status(500).send(err);
    });
};
