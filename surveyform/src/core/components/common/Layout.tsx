import React, { useEffect } from "react";
import Footer from "./Footer";
import Header from "./Header";
import DevographicsBanner from "./DevographicsBanner";
// import { useParams } from "react-router-dom";
import { getSurvey } from "~/modules/surveys/getters";
import { KeydownContextProvider } from "./KeydownContext";
import { useSurveyParams } from "../survey/hooks";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useRouter } from "next/router";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

export const Layout = ({
  children,
  surveySlug,
  surveyYear,
}: {
  children: any;
  // Form SSR
  surveySlug?: string;
  surveyYear?: string;
}) => {
  const Components = useVulcanComponents();
  const router = useRouter();
  const { query = {} } = router;
  const { source, referrer } = query;

  useEffect(() => {
    if (source) {
      localStorage.setItem("source", source.toString());
    }
    if (referrer) {
      localStorage.setItem("referrer", referrer.toString());
    }
  }, []);

  // const { loading, data = {} } = useQuery(gql(entitiesQuery));

  const { slug, year, paramsReady } = useSurveyParams({
    slug: surveySlug,
    year: surveyYear,
  });
  let style = "";

  if (paramsReady && slug && year) {
    const survey = getSurvey(slug, year);
    if (survey) {
      const { bgColor, textColor, linkColor, hoverColor } = survey;
      style = `
:root {
  --bg-color: ${bgColor};
  --text-color: ${textColor};
  --link-color: ${linkColor};
  --hover-color: ${hoverColor};
}
  `;
    }
  }
  /*loading ? (
    <Components.Loading />
  ) :*/
  return (
    <KeydownContextProvider>
      <div className="wrapper" id="wrapper">
        <style dangerouslySetInnerHTML={{ __html: style }} />
        <a href="#section-questions" className="skip">
          <FormattedMessage id="general.skip_to_content" />
        </a>
        <DevographicsBanner />
        <Header />
        <main className="main-contents" id="main-contents">
          {children}
        </main>
        <Footer />
      </div>
    </KeydownContextProvider>
  );
};

export default Layout;
