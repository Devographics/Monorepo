import ShareSite from "../share/ShareSite";
import Score from "../common/Score";
import Image from "next/image";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getSurveyImageUrl } from "~/lib/surveys/helpers";
import ReadingListResults from "~/components/reading_list/ReadingListResults";
import { EditionMetadata, ResponseDocument } from "@devographics/types";
import { ThanksBackButton } from "./ThanksBackButton";

export const Thanks = ({
  edition,
  response,
  readOnly,
}: {
  readOnly?: boolean;
  edition: EditionMetadata;
  response: ResponseDocument;
}) => {
  const imageUrl = getSurveyImageUrl(edition);
  const { survey, year } = edition;
  const { name } = survey;
  return (
    <div className="contents-narrow thanks">
      <div className="survey-message survey-finished">
        <FormattedMessage id="general.thanks1" />
      </div>
      <h1 className="survey-image survey-image-small">
        {imageUrl && (
          <Image
            width={420}
            height={280}
            src={imageUrl}
            alt={`${name} ${year}`}
            quality={100}
          />
        )}
      </h1>
      {response && <Score response={response} edition={edition} />}
      {response && <ReadingListResults response={response} edition={edition} />}

      <div>
        <FormattedMessage id="general.thanks2" />
      </div>
      <ShareSite survey={edition} />
      <ThanksBackButton
        readOnly={readOnly}
        edition={edition}
        response={response}
      />
    </div>
  );
};

export default Thanks;
