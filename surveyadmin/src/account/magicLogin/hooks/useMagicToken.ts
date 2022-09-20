import { useRouter } from "next/router.js";

/**
 * Get the token from the magic link
 * /!\ This is NOT your auth token, this is a temporary token to verify that you
 * own this email adress
 * @returns
 */
export const useMagicToken = () => {
  const router = useRouter();
  const { isReady, query } = router;
  if (!isReady) return { token: null };
  if (!query.token) throw new Error("No magic token found in query params.");
  if (Array.isArray(query.token))
    throw new Error("Found more than one token in query params.");

  if (query.from && Array.isArray(query.from)) {
    console.warn("Found more than one redirection router in query params.");
  }
  return {
    token: query.token,
    // the magic link may have a redirection
    from: query.from && !Array.isArray(query.from) ? query.from : undefined,
  };
};
