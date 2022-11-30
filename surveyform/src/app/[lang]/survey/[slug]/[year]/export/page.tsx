// SectionNumber is optional in the URL so this page is exactly the same as ../index.tsx
import SurveyExport from "~/core/components/survey/SurveyExport";

const SurveyExportPage = () => {
  return <SurveyExport />;
};

import { getLocaleServerSideProps } from "~/i18n/server/ssr";
export async function getServerSideProps(ctx) {
  return getLocaleServerSideProps(ctx);
}

export default SurveyExportPage;
