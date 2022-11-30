import React from "react";
import surveys from "~/surveys";
import { getSurveyPath } from "~/modules/surveys/getters";
import Link from "next/link";
import { statuses } from "~/modules/constants";
import LocaleSelector from "~/core/components/common/LocaleSelector";
import Translators from "~/core/components/common/Translators";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import Image from "next/image";
import { getSurveyImageUrl } from "~/surveys/getSurveyImageUrl";
import { SurveyDocument } from "@devographics/core-models";

const SurveyItem = ({ survey }: { survey: SurveyDocument }) => {
  const { name, year, status } = survey;
  const imageUrl = getSurveyImageUrl(survey);
  //const Components = useVulcanComponents();
  return (
    <div>
      <div className="survey-item">
        <div className="survey-image">
          <Link
            href={getSurveyPath({ survey, home: true })}
            className="survey-link"
          >
            <div className="survey-image-inner">
              <Image
                priority={
                  typeof status !== "undefined" && [1, 2].includes(status)
                }
                width={300}
                height={200}
                src={imageUrl}
                alt={`${name} ${year}`}
                quality={100}
              />
            </div>
            <span className="survey-name">
              <span>
                {name} {year}
              </span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const SurveyGroup = ({ status }) => {
  const filteredSurveys = surveys.filter((s) => s.status === statuses[status]);
  return (
    <div className="surveys-group">
      <h3 className="surveys-group-heading">
        <FormattedMessage id={`general.${status}_surveys`} />
      </h3>
      {filteredSurveys.length > 0 ? (
        filteredSurveys.map((survey) => (
          <SurveyItem key={survey.slug} survey={survey} />
        ))
      ) : (
        <div className={`surveys-none surveys-no${status}`}>
          <FormattedMessage id={`general.no_${status}_surveys`} />
        </div>
      )}
    </div>
  );
};

const Surveys = () => {
  return (
    <div className="surveys">
      {/* FIXME won't load useLocaleContext correctly... <LocaleSelector />*/}
      <SurveyGroup status="open" />
      <SurveyGroup status="preview" />
      <SurveyGroup status="closed" />
      {/*<Translators />*/}
    </div>
  );
};

export default Surveys;
