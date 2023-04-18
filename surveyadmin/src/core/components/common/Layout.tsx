import React, { useEffect } from "react";
import Footer from "./Footer";
import Header from "./Header";
// import { useParams } from "react-router-dom";
import { KeydownContextProvider } from "./KeydownContext";
import { useSurveyParams } from "../survey/hooks";
import { useRouter } from "next/router";

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

  return (
    <KeydownContextProvider>
      <div className="wrapper" id="wrapper">
        <style dangerouslySetInnerHTML={{ __html: style }} />
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
