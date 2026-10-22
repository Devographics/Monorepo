import { EditionMetadata, SponsorItem } from "@devographics/types";
import { DynamicT } from "@devographics/react-i18n";

const Support = ({ edition }: { edition: EditionMetadata }) => {
  if (!edition.sponsors) return null;
  return (
    <div className="support survey-page-block">
      <h3 className="support-heading survey-page-block-heading">
        <DynamicT token="general.support_from" />
      </h3>
      <div className="support-items">
        {edition.sponsors.map((sponsor) => (
          <SupportItem key={sponsor.id} sponsor={sponsor} edition={edition} />
        ))}
      </div>
    </div>
  );
};

const SupportItem = ({
  sponsor,
  edition,
}: {
  sponsor: SponsorItem;
  edition: EditionMetadata;
}) => {
  const { id, name, url, imageUrl } = sponsor;
  const urlWithTags = url.includes("utm")
    ? url
    : `${url}?utm_source=${edition.surveyId}&utm_medium=website&utm_campaign=${edition.id}`;
  return (
    <div className="support-item">
      <a href={urlWithTags} target="_blank" rel="noreferrer">
        <img src={imageUrl} alt={name} />
      </a>
    </div>
  );
};

export default Support;
