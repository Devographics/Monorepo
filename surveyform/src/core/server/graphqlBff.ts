/**
 * Utils to call graphql API from backend endpoint
 * 
 * This allows to remove client-side GraphQL calls
 * while keeping GraphQL for the server
 * allowing for a more progressive transition
 */
import { IncomingHttpHeaders } from "http";
import { NextApiRequest } from "next";

/**
 * Convert request header to a graphql friendly format
 * => this namely allows to pass cookies up to the graphql API
 */
export function gqlHeaders(req: NextApiRequest) {
    const headers: IncomingHttpHeaders = {
        ...req.headers,
        "content-type": "application/json"
    }
    delete headers["connection"]
    // for post requests
    delete headers["content-length"]
    return headers
}