import { useSearchParams } from "next/navigation";

/**
 * Get the token from the magic link
 * /!\ This is NOT your auth token, this is a temporary token to verify that you
 * own this email adress
 * @returns
 */
export const useMagicToken = () => {
  const params = useSearchParams()
  const token = params.get("token")
  const from = params.get("from")
  if (!token) throw new Error("No magic token found in query params.");
  if (Array.isArray(token))
    throw new Error("Found more than one token in query params.");

  if (from && Array.isArray(from)) {
    console.warn("Found more than one redirection router in query params.");
  }
  return {
    token: token,
    // the magic link may have a redirection
    from: from && !Array.isArray(from) ? from : undefined,
  }
};
