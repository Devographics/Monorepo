import ShareSite from "../share/ShareSite";
import Score from "../common/Score";
import { getEditionImageUrl } from "~/lib/surveys/helpers/getEditionImageUrl";
import { getEditionTitle } from "~/lib/surveys/helpers/getEditionTitle";
import ReadingListResults from "~/components/reading_list/ReadingListResults";
import { EditionMetadata, ResponseDocument } from "@devographics/types";
import { ThanksBackButton } from "./ThanksBackButton";
import { DynamicT } from "@devographics/react-i18n";

export const Finish = ({
  edition,
  response,
  readOnly,
}: {
  readOnly?: boolean;
  edition: EditionMetadata;
  response: ResponseDocument;
}) => {
  const imageUrl = getEditionImageUrl(edition);
  const { survey, year } = edition;
  const { name } = survey;
  const featureSections = edition.sections.filter(
    (section) => section.slug === "features"
  );
  const enableScore = response && featureSections.length > 0;
  const enableReadingList = edition.enableReadingList;

  return (
    <div className="contents-narrow thanks">
      <ThanksBackButton
        readOnly={readOnly}
        edition={edition}
        response={response}
      />
      <div className="survey-message survey-finished">
        <DynamicT token="general.thanks1" />
      </div>
      <h1 className="survey-image survey-image-small">
        {imageUrl && (
          <img
            width={420}
            height={280}
            src={imageUrl}
            alt={getEditionTitle({ edition })}
            //quality={100}
          />
        )}
      </h1>
      {enableScore && <Score response={response} edition={edition} />}
      {enableReadingList && response && (
        <ReadingListResults response={response} edition={edition} />
      )}

      <div>
        <DynamicT token="general.thanks2" />
      </div>
      <ShareSite edition={edition} />
    </div>
  );
};

export default Finish;
