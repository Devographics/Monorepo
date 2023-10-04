import { EditionMetadata } from "@devographics/types";
import Header from "~/components/common/Header";
import Footer from "~/components/common/Footer";
import { ReactNode } from "react";
import { FormattedMessage } from "~/components/common/FormattedMessage";
// import DevographicsBanner from "./DevographicsBanner";

const EditionLayout = ({
  edition,
  children,
}: {
  edition: EditionMetadata;
  children: ReactNode;
}) => {
  const editionLayoutClass = `wrapper survey-${edition.survey.id} edition-${edition.id}`;
  return (
    <div className={editionLayoutClass} id="wrapper">
      <a href="#section-questions" className="skip">
        <FormattedMessage id="general.skip_to_content" />
      </a>
      {/* <DevographicsBanner /> */}
      <Header edition={edition} />
      <main className="main-contents" id="main-contents">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default EditionLayout;
