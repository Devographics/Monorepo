import React from "react";
// TODO: we need to enable accounts back
// import { STATES } from "meteor/vulcan:accounts";
// import AccountMessage from "../../users/AccountMessage";
import SurveyAction from "./SurveyAction";
import { getSurvey } from "~/modules/surveys/getters";
import SurveyHeadTags from "../SurveyHeadTags";
import SurveyMessage from "../SurveyMessage";
import SurveyCredits from "../SurveyCredits";
import Translators from "../../common/Translators";
import Faq from "../../common/Faq";
import Support from "../../common/Support";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { useRouter } from "next/router.js";
import { useSurveyParams } from "../hooks";
// import { StandaloneLoginForm } from "~/core/components/account/StandaloneLoginForm";
import LoginDialog from "~/account/LoginDialog";
import { useUser } from "~/account/user/hooks";
import Image from "next/image";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

interface SurveyPageWrapperProps {
  slug?: string;
  year?: string;
}
const SurveyPageWrapper = (props: SurveyPageWrapperProps) => {
  const { paramsReady, slug, year } = useSurveyParams({
    slug: props.slug,
    year: props.year,
  });
  //const intl = useIntlContext();

  const Components = useVulcanComponents();
  if (!paramsReady) return <Components.Loading />;

  // TODO: we could get it at page level as static props,
  // and use this function only as a fallback
  const survey = getSurvey(slug, year);
  // TODO: send a better message
  if (!survey) throw new Error("Survey not found");
  const { imageUrl, name, slug: surveySlug, resultsUrl } = survey;

  // console.log(props)
  return (
    <div className="survey-page contents-narrow">
      <SurveyHeadTags survey={survey} />
      <SurveyMessage survey={survey} />

      {resultsUrl && (
        <div className="survey-results">
          <a href={resultsUrl} target="_blank" rel="noreferrer noopener">
            <FormattedMessage id="general.survey_results" />
          </a>
        </div>
      )}

      <h1 className="survey-image">
        <Image
          width={600}
          height={400}
          src={`/surveys/${imageUrl}`}
          alt={`${name} ${year}`}
        />
      </h1>
      <div className="survey-page-block">
        <SurveyMain survey={survey} />
      </div>
      <Faq survey={survey} />
      {survey.credits && <SurveyCredits survey={survey} />}
      <Translators />
      <Support />
    </div>
  );
};

const SurveyIntro = ({ survey }) => {
  const intl = useIntlContext();
  return (
    <div
      className="survey-intro"
      dangerouslySetInnerHTML={{
        __html: intl.formatMessage({
          id: `general.${survey.slug}.survey_intro`,
        }),
      }}
    />
  );
};

const useSurveyPageParams = ():
  | { paramsReady: false; email: null }
  | { paramsReady: true; email: string } => {
  const router = useRouter();
  const { isReady, isFallback, query } = router;
  if (!isReady || isFallback) return { paramsReady: false, email: null };
  const { email } = query;
  return { paramsReady: true, email: email as string };
};

const SurveyMain = ({ survey }) => {
  const Components = useVulcanComponents();
  const intl = useIntlContext();
  const { user, loading: currentUserLoading } = useUser();

  /*
  Next.js already parse query params in "query" object
  const location = useLocation();

  const query = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    decoder: (c) => c,
  });
  */
  // TODO: check if this still work
  const { paramsReady, email } = useSurveyPageParams();
  if (currentUserLoading) return <Components.Loading />;
  if (!paramsReady) return <Components.Loading />;

  // TODO: it would be cleaner to do a redirection to a login page,
  // from a middleware, so we can render this page statically yet make it private
  if (!user) {
    return <LoginDialog />;
  } else {
    return (
      <>
        <SurveyIntro survey={survey} />
        <SurveyAction survey={survey} currentUser={user} />
      </>
    );
  }
};

export default SurveyPageWrapper;
