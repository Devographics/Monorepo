import { EditionMetadata, SponsorItem } from "@devographics/types";
import { FormattedMessage } from "~/components/common/FormattedMessage";

const Support = ({ edition }: { edition: EditionMetadata }) => {
  return (
    <div className="support survey-page-block">
      <h3 className="support-heading survey-page-block-heading">
        <FormattedMessage id="general.support_from" />
      </h3>
      {edition.survey.partners.map((sponsor) => (
        <SupportItem key={sponsor.id} sponsor={sponsor} />
      ))}
    </div>
  );
};

const SupportItem = ({ sponsor }: { sponsor: SponsorItem }) => {
  const { id, name, url, imageUrl } = sponsor;
  return (
    <div className="support-item">
      <a href={url}>
        <img src={imageUrl} alt={name} />
      </a>
    </div>
  );
};

export default Support;
