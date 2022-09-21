import React from "react";
import { surveysWithTemplates } from "~/surveys/withTemplates";
// just an alias to avoid changing the whole code
const surveys = surveysWithTemplates;

//import User from "~/core/models/user";
import { getSurveyPath } from "~/modules/surveys/getters";
import Link from "next/link"; //"react-router-dom";
import { statuses } from "~/modules/constants";
import LocaleSelector from "~/core/components/common/LocaleSelector";
import Translators from "~/core/components/common/Translators";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import Image from "next/image";

const SurveyItem = ({ survey }) => {
  const { imageUrl, name, year, resultsUrl } = survey;
  //const Components = useVulcanComponents();
  return (
    <div>
      <div className="survey-item">
        <div className="survey-image">
          <Link href={getSurveyPath({ survey, home: true })}>
            <a className="survey-link">
              <span className="survey-image-inner">
                <Image
                  width={300}
                  height={200}
                  src={`/surveys/${imageUrl}`}
                  alt={`${name} ${year}`}
                />
              </span>
              <span className="survey-name">
                <span>
                  {name} {year}
                </span>
              </span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

const SurveyGroup = ({ status }) => {
  const filteredSurveys = surveys.filter((s) => s.status === statuses[status]);
  const Components = useVulcanComponents();
  return (
    <div className="surveys-group">
      <h3 className="surveys-group-heading">
        <Components.FormattedMessage id={`general.${status}_surveys`} />
      </h3>
      {filteredSurveys.length > 0 ? (
        filteredSurveys.map((survey) => (
          <SurveyItem key={survey.slug} survey={survey} />
        ))
      ) : (
        <div className={`surveys-none surveys-no${status}`}>
          <Components.FormattedMessage id={`general.no_${status}_surveys`} />
        </div>
      )}
    </div>
  );
};

const Surveys = () => {
  return (
    <div className="surveys">
      <LocaleSelector />
      <SurveyGroup status="open" />
      <SurveyGroup status="preview" />
      <SurveyGroup status="closed" />
      <Translators />
    </div>
  );
};

export default Surveys;
