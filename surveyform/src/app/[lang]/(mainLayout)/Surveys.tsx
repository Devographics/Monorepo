import Link from "next/link";
import { SurveyStatusEnum } from "@devographics/types";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { getEditionImageUrl } from "~/lib/surveys/helpers/getEditionImageUrl";
import { getEditionTitle } from "~/lib/surveys/helpers/getEditionTitle";
import { getEditionHomePath } from "~/lib/surveys/helpers/getEditionHomePath";
import sortBy from "lodash/sortBy";
import { rscCurrentUserWithResponses } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { ResponseDetails } from "~/components/surveys/ResponseDetails";
import { rscLocaleIdContext } from "~/i18n/rsc-context";
import { ServerT } from "~/i18n/components/ServerT";

const EditionItem = async ({
  edition,
  homePath,
}: {
  edition: EditionMetadata;
  homePath: string;
}) => {
  const { survey, year, status } = edition;
  const { name } = survey;
  const imageUrl = getEditionImageUrl(edition);

  const currentUser = await rscCurrentUserWithResponses();
  const response = currentUser?.responses?.find(
    (r) => r.editionId === edition.id
  );

  return (
    <div className="survey-item">
      <div>
        <div className="survey-image">
          <Link href={homePath} className="survey-link">
            <div className="survey-image-inner">
              {imageUrl && (
                <img
                  /*
                  priority={
                    typeof status !== "undefined" && [1, 2].includes(status)
                  }*/
                  width={300}
                  height={200}
                  src={imageUrl}
                  alt={getEditionTitle({ edition })}
                //quality={100}
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
      {response && <ResponseDetails edition={edition} response={response} />}
    </div>
  );
};

const EditionGroup = ({
  allEditions,
  status,
}: {
  allEditions: Array<EditionMetadata>;
  status: SurveyStatusEnum;
}) => {
  if (!status) throw new Error("SurveyGroup must receive a defined status");
  const filteredEditions = allEditions.filter((s) => s.status === status);
  const sortedEdition = sortBy(
    filteredEditions,
    (edition: EditionMetadata) => new Date(edition.startedAt)
  ).reverse();
  const localeId = rscLocaleIdContext()
  const locale = { id: localeId };
  return (
    <div className="surveys-group">
      <h3 className="surveys-group-heading">
        {/** 
         * This is an example of a dynamic token
         * We can't replace it by a token expression because status is an actual JS variable
         * that is not known from the build context
         * But we could filter tokens on the expression "general.[possibleSurveyStatus]_surveys"
         * (not needed for server translations thogugh)
         *  */}
        <ServerT token={`general.${SurveyStatusEnum[status].toLowerCase()}_surveys`} />
        {/*<FormattedMessage
          id={`general.${SurveyStatusEnum[status].toLowerCase()}_surveys`}
        />*/}
      </h3>
      {sortedEdition.length > 0 ? (
        sortedEdition.map((edition) => (
          <EditionItem
            key={edition.id}
            edition={edition}
            homePath={getEditionHomePath({ edition, locale })}
          />
        ))
      ) : (
        <div className={`surveys-none surveys-no${status}`}>
          <ServerT token={`general.no_${SurveyStatusEnum[status].toLowerCase()}_surveys`}
          />
        </div>
      )}
    </div>
  );
};

const Surveys = ({
  surveys,
}: {
  surveys: Array<SurveyMetadata>;
}) => {
  const allEditions = surveys
    .map((survey) => survey.editions.map((e) => ({ ...e, survey })))
    .flat();
  return (
    <div className="surveys">
      {/* FIXME won't load useLocaleContext correctly... <LocaleSelector />*/}
      <EditionGroup
        allEditions={allEditions}
        status={SurveyStatusEnum.OPEN}
      />
      <EditionGroup
        allEditions={allEditions}
        status={SurveyStatusEnum.PREVIEW}
      />
      <EditionGroup
        allEditions={allEditions}
        status={SurveyStatusEnum.CLOSED}
      />
      {/*<Translators />*/}
    </div>
  );
};

export default Surveys;
