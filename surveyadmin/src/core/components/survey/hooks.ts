import { useRouter } from "next/router.js";
import { useMounted } from "~/core/hooks/useMounted";

export const useSurveyParams = (fromProps?: {
  slug?: string;
  year?: string;
}):
  | { paramsReady: false; slug: null; year: null }
  | { paramsReady: true; slug: string; year: string } => {
  const router = useRouter();
  const isMounted = useMounted();
  // In the context of SSR, we get the param from static props
  // so no need to wait for rehydratation client-side, we can render statically
  if (fromProps && fromProps.slug && fromProps.year)
    return {
      paramsReady: true,
      slug: fromProps.slug,
      year: fromProps.year,
    };
  // NOTE: this should happen only if we disable static rendering
  const { isReady, isFallback, query } = router;
  // NOTE: if the page has data requirements, isReady will be true even on first rehydratation render client-side
  // while it's false on server, that's why it should normally be used only in useEffect
  // => it's important to also check if the component is mounted! This is equivalent to using useEffect but cleaner
  if (!isReady || !isMounted || isFallback)
    return { paramsReady: false, slug: null, year: null };
  const { slug, year } = query;
  return { paramsReady: true, slug: slug as string, year: year as string };
};

/**
 * The "read-only" param will display the form in read-only mode
 *
 * TODO: typings are not great yet, to be improved
 */
export const useSurveyResponseParams = ():
  | {
      paramsReady: false;
      slug: null;
      year: null;
      responseId: undefined;
      sectionNumber: undefined;
    }
  | {
      paramsReady: true;
      slug: string;
      year: string;
      responseId: string;
      sectionNumber?: number;
    } => {
  const router = useRouter();
  const rootParams = useSurveyParams(); // slug and year
  const isMounted = useMounted();
  const { query, isReady, isFallback } = router;
  // FIXME: somehow isReady is set to true during server-render, I don't get why
  // it should be ready only during rehydratation
  if (!isReady || !isMounted || isFallback)
    // @ts-ignore
    return {
      ...rootParams,
      paramsReady: false,
      responseId: undefined,
      sectionNumber: undefined,
    };
  const { responseId, sectionNumber } = query;
  // @ts-ignore
  return {
    ...rootParams,
    responseId: responseId as string,
    sectionNumber: sectionNumber
      ? parseInt(sectionNumber as string)
      : undefined,
    paramsReady: true,
  };
};
