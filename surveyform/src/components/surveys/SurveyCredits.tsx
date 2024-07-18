import type { EditionMetadata, Credit } from "@devographics/types";
import { publicConfig } from "~/config/public";
import { DynamicT } from "@devographics/react-i18n";

const SurveyCredits = ({ edition }: { edition: EditionMetadata }) => {
  return (
    <div className="survey-credits survey-page-block">
      <h3 className="survey-credits-heading survey-page-block-heading">
        <DynamicT token="credits.contributors" />
      </h3>
      <p>
        <DynamicT token="credits.contributors.description" />
      </p>
      <div className="survey-credits-items">
        {edition.credits
          .filter((c) => ["survey_design", "survey_review"].includes(c.role))
          .map((c) => (
            <SurveyCredit key={c.id} {...c} />
          ))}
      </div>
    </div>
  );
};

const SurveyCredit = ({ id, role, entity }: Credit) => {
  if (!entity) {
    return <div>No entity found for {id}</div>;
  }
  const { name, company, twitterName, homepageUrl } = entity;
  const link = homepageUrl
    ? homepageUrl
    : twitterName
    ? `https://twitter.com/${twitterName}`
    : "#";
  return (
    <div className="survey-credits-item">
      <a href={link} className="survey-credits-item-avatar">
        {/* <img src={twitter?.avatarUrl} alt="twitter avatar" /> */}
        <img
          src={`${publicConfig.assetUrl}/avatars/${id}.jpg`}
          alt="twitter avatar"
        />
      </a>
      <div className="survey-credits-item-details">
        <h4 className="survey-credits-item-name">
          <a href={link}>{name}</a>
        </h4>
        {company && (
          <p className="survey-credits-item-company">
            <a
              href={
                typeof company?.homepage === "string"
                  ? company.homepage
                  : company.homepage?.url
              }
            >
              {company.name}
            </a>
          </p>
        )}
        {/* <p className="survey-credits-item-twitter">
          <a href={`https://twitter.com/${twitterName}`}>@{twitterName}</a>
        </p> */}
      </div>
    </div>
  );
};

export default SurveyCredits;
