"use client";
import { useState } from "react";
import { FormInputProps } from "../form/typings";
import { EntityWithQuestion } from "~/lib/surveys/types";
import { getEditionEntities } from "~/lib/surveys/helpers/getEditionEntities";
import { Button } from "~/components/ui/Button";
import { Share } from "~/components/icons";
import { T, useI18n } from "@devographics/react-i18n";
// import { captureException } from "@sentry/nextjs";

import FormControl from "react-bootstrap/FormControl";
import { sendReadingList } from "../page/services";
import { LoadingButton } from "../ui/LoadingButton";
import { EditionMetadata, ResponseDocument, SurveyStatusEnum } from "@devographics/types";
import ItemLabel from "./ItemLabel";
import truncate from "lodash/truncate";

const cutoff = 3;

export const ReadingList = ({
  edition,
  response,
}: {
  edition: EditionMetadata;
  response: ResponseDocument;
}) => {
  const allEntities = getEditionEntities(edition);

  const readingList = response?.readingList;

  const [showMore, setShowMore] = useState(false);

  if (!readingList || readingList.length === 0) {
    // We can't update readling lists for closed surveys,
    // so there is no point into showing the empty message
    if (edition.status === SurveyStatusEnum.CLOSED) return null
    return (
      <div className="reading-list reading-list-results">
        <h5 className="reading-list-title">
          <T token="readinglist.title" />
        </h5>
        <T token="readinglist.empty" />
      </div>
    );
  } else {
    const hasTooManyItems = readingList?.length > cutoff;
    const cutoffReadingList = showMore
      ? readingList
      : readingList.slice(0, cutoff);

    return (
      <div className="reading-list reading-list-results">
        <h5 className="reading-list-title">
          <T token="readinglist.title" />
        </h5>
        <p className="reading-list-description">
          <T token="readinglist.results" />
        </p>
        <div className="reading-list-items">
          {cutoffReadingList.map((itemId) => {
            const entity = allEntities.find((e) => e.id === itemId);
            return entity && entity.question ? (
              <ListItem key={itemId} itemId={itemId} entity={entity} />
            ) : null;
          })}
          {hasTooManyItems && (
            <div className="reading-list-show-more">
              <Button
                className="form-show-more"
                onClick={() => {
                  setShowMore((showMore) => !showMore);
                }}
              >
                <T
                  token={showMore ? "forms.less_options" : "forms.more_options"}
                />
              </Button>
            </div>
          )}
        </div>
        <SendByEmail response={response} edition={edition} />
      </div>
    );
  }
};

const ListItem = ({
  itemId,
  entity,
}: {
  itemId: string;
  entity: EntityWithQuestion;
}) => {
  const {
    mdn,
    github,
    homepage,
    w3c,
    caniuse,
    resources,
    descriptionClean,
    descriptionHtml,
    question,
  } = entity;

  const { t } = useI18n()
  const featureDescription = t(`features.${itemId}.description`);
  const toolDescription = t(`tools.${itemId}.description`)
  const entityDescription = descriptionHtml || descriptionClean;
  const description =
    featureDescription || toolDescription || entityDescription;

  return (
    <div className="reading-list-item">
      <h5 className="reading-list-item-title">
        {homepage?.url ? (
          <a href={homepage.url} className="reading-list-item-title-link">
            <ItemLabel entity={entity} />
            <Share />
          </a>
        ) : (
          <ItemLabel entity={entity} />
        )}
        <ul className="reading-list-item-links">
          {mdn && <LinkItem url={mdn.url} label="MDN" />}
          {github?.url && <LinkItem url={github.url} label="GitHub" />}
          {w3c?.url && <LinkItem url={w3c.url} label="w3c" />}
          {caniuse?.url && <LinkItem url={caniuse.url} label="CanIUse" />}
        </ul>
      </h5>
      {description && (
        <div
          className="reading-list-item-summary"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
      {mdn?.summary && (
        <div className="reading-list-item-summary">{mdn.summary}</div>
      )}
      {resources && (
        <ul className="reading-list-item-resources">
          {resources.map(({ title, url }, index) => {
            let domain;
            try {
              domain = new URL(url).hostname.replace("www.", "");
            } catch (error) {
              console.log(`Invalid URL: ${url}`);
            }
            return (
              <li key={index} className="reading-list-item-resources-item">
                <a href={url}>{title || truncate(url, { length: 50 })}</a>
                {domain && (
                  <span className="reading-list-item-resources-item-domain">
                    {domain}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const LinkItem = ({ url, label }) => (
  <li>
    <Button target="_blank" href={url} className="reading-list-link-button">
      <span>{label}</span>
      <Share />
    </Button>
  </li>
);

export const SendByEmail = ({
  response,
  edition,
}: {
  response: ResponseDocument;
  edition: EditionMetadata;
}) => {
  const localStorageEmail =
    (typeof localStorage !== "undefined" && localStorage.getItem("email")) ||
    "";
  const [email, setEmail] = useState(localStorageEmail);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorResponse, setErrorResponse] = useState();
  const { t } = useI18n()
  const handleChange = (event) => {
    const value = event.target.value;
    setEmail(value);
  };

  const handleSubmit = async () => {
    if (!response) throw new Error("Can send reading list in read-only mode");
    setLoading(true);
    const res = await sendReadingList({
      responseId: response._id,
      editionId: edition.id,
      surveyId: edition.survey.id,
      email,
    });
    if (res.error) {
      console.error(res.error);
      // captureException(res.error);
      setErrorResponse(res.error);
    } else {
      setShowSuccess(true);
    }
    setLoading(false);
  };
  return (
    <div className="reading-list-send">
      <p className="reading-list-send-title">
        <T token="readinglist.receive_copy" />
      </p>
      <div className="reading-list-form">
        <FormControl
          placeholder={t("user_info.email")}
          type="email"
          value={email}
          onChange={handleChange}
        />
        <LoadingButton loading={loading} onClick={handleSubmit}>
          <T token="readinglist.send_by_email" />
        </LoadingButton>
      </div>
      {errorResponse && (
        <div className="survey-message survey-error">ERROR</div>
      )}
      {showSuccess && (
        <div className="survey-message survey-success">
          <T token="readinglist.email_sent" />
        </div>
      )}
    </div>
  );
};

export default ReadingList;
