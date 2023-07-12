import { FormattedMessage } from "~/components/common/FormattedMessage";
import type { EditionMetadata, Credit } from "@devographics/types";
import { getEnvVar, EnvVar } from "@devographics/helpers";

const SurveyCredits = ({ edition }: { edition: EditionMetadata }) => {
  return (
    <div className="survey-credits survey-page-block">
      <h3 className="survey-credits-heading survey-page-block-heading">
        <FormattedMessage id="credits.contributors" />
      </h3>
      <p>
        <FormattedMessage id="credits.contributors.description" />
      </p>
      <div className="survey-credits-items">
        {edition.credits
          .filter((c) => c.role === "survey_design")
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
  const { name, company, twitterName } = entity;
  return (
    <div className="survey-credits-item">
      <a
        href={`https://twitter.com/${twitterName}`}
        className="survey-credits-item-avatar"
      >
        {/* <img src={twitter?.avatarUrl} alt="twitter avatar" /> */}
        <img
          src={`${getEnvVar(EnvVar.ASSETS_URL)}/avatars/${id}.jpg`}
          alt="twitter avatar"
        />
      </a>
      <div className="survey-credits-item-details">
        <h4 className="survey-credits-item-name">
          <a href={`https://twitter.com/${twitterName}`}>{name}</a>
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
