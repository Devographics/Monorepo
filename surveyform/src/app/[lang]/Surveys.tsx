import Link from "next/link";
import { SurveyStatusEnum } from "@devographics/types";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import Image from "next/image";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { getEditionHomePath, getSurveyImageUrl } from "~/lib/surveys/helpers";
import { SurveyParamsTable } from "~/lib/surveys/data";

const EditionItem = ({
  edition,
  homePath,
}: {
  edition: EditionMetadata;
  homePath: string;
}) => {
  const { survey, year, status } = edition;
  const { name } = survey;
  const imageUrl = getSurveyImageUrl(edition);
  // console.log(edition);
  return (
    <div>
      <div className="survey-item">
        <div className="survey-image">
          <Link href={homePath} className="survey-link">
            <div className="survey-image-inner">
              {imageUrl && (
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
              )}
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

const EditionGroup = ({
  allEditions,
  surveyParamsTable,
  status,
}: {
  allEditions: Array<EditionMetadata>;
  surveyParamsTable: SurveyParamsTable;
  status: SurveyStatusEnum;
}) => {
  if (!status) throw new Error("SurveyGroup must receive a defined status");
  const filteredEditions = allEditions.filter((s) => s.status === status);
  return (
    <div className="surveys-group">
      <h3 className="surveys-group-heading">
        <FormattedMessage id={`general.${status}_surveys`} />
      </h3>
      {filteredEditions.length > 0 ? (
        filteredEditions.map((edition) => (
          <EditionItem
            key={edition.id}
            edition={edition}
            homePath={getEditionHomePath(edition, surveyParamsTable)}
          />
        ))
      ) : (
        <div className={`surveys-none surveys-no${status}`}>
          <FormattedMessage id={`general.no_${status}_surveys`} />
        </div>
      )}
    </div>
  );
};

const Surveys = ({
  surveys,
  surveyParamsTable,
}: {
  surveys: Array<SurveyMetadata>;
  surveyParamsTable: SurveyParamsTable;
}) => {
  const allEditions = surveys
    .map((survey) => survey.editions.map((e) => ({ ...e, survey })))
    .flat();
  return (
    <div className="surveys">
      {/* FIXME won't load useLocaleContext correctly... <LocaleSelector />*/}
      <EditionGroup
        surveyParamsTable={surveyParamsTable}
        allEditions={allEditions}
        status={SurveyStatusEnum.OPEN}
      />
      <EditionGroup
        surveyParamsTable={surveyParamsTable}
        allEditions={allEditions}
        status={SurveyStatusEnum.PREVIEW}
      />
      <EditionGroup
        surveyParamsTable={surveyParamsTable}
        allEditions={allEditions}
        status={SurveyStatusEnum.CLOSED}
      />
      {/*<Translators />*/}
    </div>
  );
};

export default Surveys;
