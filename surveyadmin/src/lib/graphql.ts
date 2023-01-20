import { createSwrGraphqlClient } from "@devographics/swr-graphql"
/**
 * Get grahql URI, based on either an absolute or relative URI
 */
export const getAppGraphqlUri = (
  /**
   * Not used client side, but mandatory server-side,
   * get this value from req.headers.origin during SSR
   **/
  originFromReq?: string
) => {
  const uriFromEnv =
    process.env.NEXT_PUBLIC_GRAPHQL_URI ?? "http://localhost:3000/api/graphql";
  const isAbsolute = uriFromEnv.startsWith("http");
  if (isAbsolute) return uriFromEnv;
  const origin =
    typeof window !== "undefined" ? window.location.origin : originFromReq;

  if (origin) {
    return `${origin}${uriFromEnv}`;
  } else {
    // If you need to enable Apollo data fetching server-side during render
    // (which is not advised!) you'll need to pass a domain computed from the request object
    // We provide 2 fallbacks: Vercel URL, and a dumb absolute URL
    // Anyway they will probably never be used if you don't SSR apollo with data
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}${uriFromEnv}`;
    }
    return "http://localhost:3000/api/graphql";
  }
};

export const { useQuery, useMutation } = createSwrGraphqlClient(getAppGraphqlUri())