import SurveySectionSwitcher from "~/core/components/survey/SurveySectionSwitcher";

const SurveyFromResponseIdPage = () => {
  return <SurveySectionSwitcher />;
};

import { getLocaleServerSideProps } from "~/i18n/server/ssr";
export async function getServerSideProps(ctx) {
  return getLocaleServerSideProps(ctx);
}

export default SurveyFromResponseIdPage;
