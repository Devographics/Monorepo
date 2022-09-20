import merge from "lodash/merge.js"
import omit from "lodash/omit.js"
import { GetStaticProps, GetStaticPropsResult } from "next";
import SurveyPageComponent from "~/core/components/survey/page/SurveyPage";
import { getLocaleStaticProps } from "~/i18n/server/ssr";
import { getSurvey } from "~/modules/surveys/helpers";
import surveys from "~/surveys";

interface SurveyPageServerProps {
  slug?: string,
  year?: string,
}
export const SurveyPage = ({ slug, year }: SurveyPageServerProps) => {
  return <SurveyPageComponent slug={slug} year={year} />;
};


export async function getStaticPaths() {
  return {
    paths: surveys.map(s => ({
      params: {
        slug: s.prettySlug,
        year: String(s.year)
      },
      // other locales will be rendered on first request with ISR
      locale: "en-US"
    })),
    // render other languages/new surveys on first request only
    fallback: "blocking"
  }
}

const SURVEY_TIMEOUT_SECONDS = 5 * 60
export const getStaticProps: GetStaticProps = async (ctx) => {
  const localeProps = await getLocaleStaticProps(ctx);
  if (!ctx.params) return localeProps

  const { slug, year } = ctx.params
  const survey = getSurvey(slug, year)
  if (!survey) {
    return { notFound: true }
  }

  const surveyProps: GetStaticPropsResult<SurveyPageServerProps> = {
    props: {
      // NOTE: we DON'T pass the survey because it is not
      // correctly serializable, the survey will be retrived client-side
      // without trouvle
      // NOTE: the cast seems currently mandatory as Next cannot tell
      // if they are an array of parameters or just a parameter
      slug: slug as string,
      year: year as string,
    },
    revalidate: SURVEY_TIMEOUT_SECONDS
  }
  const props = merge({}, localeProps, surveyProps)
  return props
}

export default SurveyPage;
