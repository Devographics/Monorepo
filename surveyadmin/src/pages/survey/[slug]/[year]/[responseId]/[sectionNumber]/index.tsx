// SectionNumber is optional in the URL so this page is exactly the same as ../index.tsx
import SurveySectionSwitcher from "~/core/components/survey/SurveySectionSwitcher";

const SurveyFromResponseIdPage = () => {
  return <SurveySectionSwitcher />;
};

import { getLocaleServerSideProps } from "~/i18n/server/ssr";
export async function getServerSideProps(ctx) {
  return getLocaleServerSideProps(ctx);
}
export default SurveyFromResponseIdPage;
