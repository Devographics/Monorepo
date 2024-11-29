/**
 * Until Next.js provides this type out of the box...
 */
export interface RouteHandlerOptions<TParams = any> {
  params: Promise<TParams>;
}
