import { getEditionHomePath } from "~/surveys/helpers";
import Link from "next/link";
import { statuses } from "~/surveys/constants";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import Image from "next/image";
import { getSurveyImageUrl } from "~/surveys/getSurveyImageUrl";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";

const EditionItem = ({ edition }: { edition: EditionMetadata }) => {
  const { survey, year, status } = edition;
  const { name } = survey;
  const imageUrl = getSurveyImageUrl(edition);
  // console.log(edition);
  return (
    <div>
      <div className="survey-item">
        <div className="survey-image">
          <Link href={getEditionHomePath(edition)} className="survey-link">
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
  status,
}: {
  allEditions: Array<EditionMetadata>;
  status: string;
}) => {
  if (!status) throw new Error("SurveyGroup must receive a defined status");
  const filteredEditions = allEditions.filter(
    (s) => s.status === statuses[status]
  );
  return (
    <div className="surveys-group">
      <h3 className="surveys-group-heading">
        <FormattedMessage id={`general.${status}_surveys`} />
      </h3>
      {filteredEditions.length > 0 ? (
        filteredEditions.map((edition) => (
          <EditionItem key={edition.id} edition={edition} />
        ))
      ) : (
        <div className={`surveys-none surveys-no${status}`}>
          <FormattedMessage id={`general.no_${status}_surveys`} />
        </div>
      )}
    </div>
  );
};

const Surveys = ({ surveys }: { surveys: Array<SurveyMetadata> }) => {
  const allEditions = surveys
    .map((survey) => survey.editions.map((e) => ({ ...e, survey })))
    .flat();
  return (
    <div className="surveys">
      {/* FIXME won't load useLocaleContext correctly... <LocaleSelector />*/}
      <EditionGroup allEditions={allEditions} status={"open"} />
      <EditionGroup allEditions={allEditions} status={"preview"} />
      <EditionGroup allEditions={allEditions} status={"closed"} />
      {/*<Translators />*/}
    </div>
  );
};

export default Surveys;
