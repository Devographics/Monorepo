import React from 'react';
import { spacing, mq } from 'core/theme'
import styled from 'styled-components'
import T from 'core/i18n/T'
import credits from 'Config/credits.yml'
import { useEntities } from 'core/entities/entitiesContext'

const SurveyCredits = ({ survey }) => {
  return (
    <div className="survey-credits survey-page-block">
      <h3 className="survey-credits-heading survey-page-block-heading">
        <T k="credits.thanks" />
      </h3>
      <div className="survey-credits-items">
        {credits.map((c) => (
          <SurveyCreditItem key={c.id} {...c} />
        ))}
      </div>
    </div>
  );
};


const SurveyCreditItem = ({ id, role }) => {
  const { getEntity } = useEntities()
  const entity = getEntity(id)
  const { name, twitterName, twitter } = entity
  return (
  <div className="survey-credits-item">
    <a href={`https://twitter.com/${twitterName}`} className="survey-credits-item-avatar">
      <img src={twitter?.avatarUrl} />
    </a>
    <div className="survey-credits-item-details">
      <h4 className="survey-credits-item-name">{name}</h4>
      <p className="survey-credits-item-twitter">
        <a href={`https://twitter.com/${twitterName}`}>@{twitterName}</a>
      </p>
      <p className="survey-credits-item-role">
        <T k={`credits.${role}`} />
      </p>
    </div>
  </div>
)};

export default SurveyCredits;
