import React from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useEntitiesQuery } from "~/core/hooks/useEntitiesQuery";
import { Entity } from "~/modules/entities/typings";
import type { SurveyType } from "@devographics/core-models";

const SurveyCredits = ({ survey }) => {
  const Components = useVulcanComponents();
  return (
    <div className="survey-credits survey-page-block">
      <h3 className="survey-credits-heading survey-page-block-heading">
        <Components.FormattedMessage id="credits.contributors" />
      </h3>
      <p>
        <Components.FormattedMessage id="credits.contributors.description" />
      </p>
      <div className="survey-credits-items">
        <SurveyCreditItems survey={survey} />
      </div>
    </div>
  );
};

const SurveyCreditItems = ({ survey }: { survey: SurveyType }) => {
  const Components = useVulcanComponents();
  const surveyDesignersIds = survey.credits
    .filter((c) => c.role === "survey_design")
    .map((c) => c.id)
    // in case there are null values
    .filter((id) => !!id);
  const { data, loading, error } = useEntitiesQuery({
    id: { _in: surveyDesignersIds },
  });
  if (error) return <span>Could not load entities</span>;
  if (loading) return <Components.Loading />;
  if (!data) return <span>No entities found</span>;
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

const SurveyCreditItem = ({ name, twitterName, twitter, role, company }) => {
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
            <a href={company.homepage.url}>{company.name}</a>
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
