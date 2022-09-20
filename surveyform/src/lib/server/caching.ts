/**
 * Previously exposed by Vulcan Meteor core package,
 * packages/vulcan-lib/lib/server/caching.js
 * we prefer to define this at app level
 */
import { captureException } from "@sentry/nextjs";
import NodeCache from "node-cache";

/**
 * NOTE: you won't have one instance of the cache per app!
 * But instead one instance per API routes + serverless instance
 *
 * So it's impossible to completely flush the cache
 *
 * It is still interesting for graphql, since the whole API
 * runs on a single endpoint thus can share this cache
 * accross resolvers
 *
 * /!\ DO NOT USE WITH PROMISES OR CLASS INSTANCES, only with POJO
 */
export const nodeCache = new NodeCache();
/**
 * Use when cloning promises
 * @see https://github.com/node-cache/node-cache#options
 * @see https://github.com/node-cache/node-cache/issues/30
 */
export const promisesNodeCache = new NodeCache({
  useClones: false,
});

/**
 * Run an async promise only once
 * Useful to avoid sending multiple requests during peaks of usage
 * (if there are a 100 connections before the results are there, we still send
 * only one request)
 *
 * Sorry for the typings, but it seems to work
 *
 * /!\ PROVIDE A NODE CACHE WITH OPTION "useClones" DISABLED! Otherwise the "catch" won't work
 *
 *
 * @param nodeCache
 * @param cacheKey
 * @param TTL_MS
 * @returns
 */
export const cachedPromise =
  (nodeCache: NodeCache, cacheKey: string, TTL_SECONDS?: number) =>
  <TReturn>(asyncFn: () => Promise<TReturn>): Promise<TReturn> => {
    let promise;
    const promiseFromCache = nodeCache.get(cacheKey) as Promise<TReturn>;
    if (!promiseFromCache) {
      console.info(`Cache MISS for cached promise "${cacheKey}"`);
      promise = asyncFn().catch((err) => {
        // This catch block will be called in case error
        // I haven't found a way to both use "try/catch" and manipulate the promise, it just doesn't work
        captureException(err);
        // Don't forget to drop failed promises from the cache!
        nodeCache.del(cacheKey);
        console.error(
          `Error in a cached promise "${cacheKey}", will flush the cache and return undefined`,
          err
        );
        // NOTE: if you don't use a node cache with "useClones: false" you will never be able to catch the error
        // because the promise gets cloned! Be careful to pass a "promisesNodeCache" with the right options
        // @see https://github.com/node-cache/node-cache/issues/30
        throw err;
      });
      if (typeof TTL_SECONDS !== "undefined") {
        nodeCache.set(cacheKey, promise, TTL_SECONDS);
      } else {
        nodeCache.set(cacheKey, promise);
      }
    } else {
      console.info(`Cache HIT for cached promise "${cacheKey}"`);
      promise = promiseFromCache;
    }
    return promise;
  };
