import React, { useEffect } from "react";
import Footer from "./Footer";
import Header from "./Header";
import DevographicsBanner from "./DevographicsBanner";
// import { useParams } from "react-router-dom";
import { KeydownContextProvider } from "./KeydownContext";
import { useSearchParams } from "next/navigation";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

export const Layout = ({ children }: { children: any }) => {
  //const router = useRouter();
  const query = useSearchParams();
  //const { query = {} } = router;
  // const { source, referrer } = query;
  const source = query.get("source");
  const referrer = query.get("referrer");

  useEffect(() => {
    if (source) {
      localStorage.setItem("source", source.toString());
    }
    if (referrer) {
      localStorage.setItem("referrer", referrer.toString());
    }
  }, []);

  return (
    <KeydownContextProvider>
      <div className="wrapper" id="wrapper">
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
