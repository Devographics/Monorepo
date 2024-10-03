/**
 * NOTE: making this a function helps testing,
 * because process may be undefined
 * @returns
 */
export const isAnonymousAuthEnabled = () =>
  process.env.NEXT_PUBLIC_ENABLE_ANONYMOUS_AUTH;
