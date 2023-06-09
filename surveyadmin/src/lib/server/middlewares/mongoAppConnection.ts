/**
 * Similar to "mongoConnection" middleware but uses the default uri
 */

import { getAppDb } from "@devographics/mongo";

/**
 * Mongoose connection is not set automtically,
 * we need to trigger the connection for each middleware!
 *
 * We can be tricked by the seed step in production, this is important
 */
export const connectToAppDbMiddleware = (req, res, next) => {
  getAppDb()
    .then(() => {
      return next();
    })
    .catch((err) => {
      return res.status(500).send(err);
    });
};
