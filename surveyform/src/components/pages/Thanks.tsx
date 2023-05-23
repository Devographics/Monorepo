"use client";
import ShareSite from "../share/ShareSite";
import { getEditionSectionPath } from "~/lib/surveys/helpers";
import Score from "../common/Score";
import Image from "next/image";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getSurveyImageUrl } from "~/lib/surveys/helpers";
import Link from "next/link";
import { useEdition } from "~/components/SurveyContext/Provider";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { Loading } from "~/components/ui/Loading";
import { useResponse } from "~/lib/responses/hooks";

export const Thanks = ({
  responseId,
  readOnly,
}: {
  responseId?: string;
  readOnly?: boolean;
}) => {
  const { locale } = useLocaleContext();
  const { edition } = useEdition();
  const imageUrl = getSurveyImageUrl(edition);
  const { survey, year } = edition;
  const { name } = survey;
  // TODO: get from server, see ongoing investigation

  const {
    response,
    loading: responseLoading,
    error: responseError,
  } = useResponse({ responseId });

  if (responseLoading) {
    return <Loading />;
  }

  return (
    <div className="contents-narrow thanks">
      <h1 className="survey-image survey-image-small">
        {imageUrl && (
          <Image
            width={300}
            height={200}
            src={imageUrl}
            alt={`${name} ${year}`}
            quality={100}
          />
        )}
      </h1>
      {response && <Score response={response} edition={edition} />}
      <div>
        <FormattedMessage id="general.thanks" />
      </div>
      <ShareSite survey={edition} />
      <div className="form-submit form-section-nav form-section-nav-bottom">
        <div className="form-submit-actions">
          <Link
            className="form-btn-prev"
            href={getEditionSectionPath({
              edition,
              response,
              forceReadOnly: readOnly,
              number: edition.sections.length,
              locale,
            })}
          >
            « <FormattedMessage id="general.back" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Thanks;
