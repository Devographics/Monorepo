import React from "react";
import { Entity } from "@devographics/core-models";
import type { SurveyType } from "@devographics/core-models";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { useEntities } from "~/core/components/common/EntitiesContext";

const SurveyCredits = ({ survey }) => {
  return (
    <div className="survey-credits survey-page-block">
      <h3 className="survey-credits-heading survey-page-block-heading">
        <FormattedMessage id="credits.contributors" />
      </h3>
      <p>
        <FormattedMessage id="credits.contributors.description" />
      </p>
      <div className="survey-credits-items">
        <SurveyCreditItems survey={survey} />
      </div>
    </div>
  );
};

const SurveyCreditItems = ({ survey }: { survey: SurveyType }) => {
  const { data, loading, error } = useEntities();
  const { entities } = data;
  return (
    <>
      {survey.credits
        .filter((c) => c.role === "survey_design")
        .map((c) => {
          const entity = entities && entities.find((e) => e.id === c.id);
          return <SurveyCredit key={c.id} {...c} entity={entity} />;
        })}
    </>
  );
};

const SurveyCredit = ({
  id,
  role,
  entity,
}: {
  id: string;
  role?: string;
  entity: Entity;
}) => {
  return <SurveyCreditItem {...entity} role={role} />;
};

const SurveyCreditItem = ({
  name,
  twitterName,
  twitter,
  role,
  company,
}: Entity & { role?: string }) => {
  return (
    <div className="survey-credits-item">
      <a
        href={`https://twitter.com/${twitterName}`}
        className="survey-credits-item-avatar"
      >
        <img src={twitter?.avatarUrl} alt="twitter avatar" />
      </a>
      <div className="survey-credits-item-details">
        <h4 className="survey-credits-item-name">
          <a href={`https://twitter.com/${twitterName}`}>{name}</a>
        </h4>
        {company && (
          <p className="survey-credits-item-company">
            <a href={company?.homepage?.url}>{company.name}</a>
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
