"use client";
import { useState } from "react";
import { FormattedMessage } from "../common/FormattedMessage";
import { FormInputProps } from "../form/typings";
import {
  EntityWithQuestion,
  getEditionEntities,
  getEditionQuestions,
} from "~/lib/surveys/helpers";
import EntityLabel from "~/components/common/EntityLabel";
import { Button } from "~/components/ui/Button";
import { Share } from "~/components/icons";
import { useIntlContext } from "@devographics/react-i18n";
import { captureException } from "@sentry/nextjs";

import FormControl from "react-bootstrap/FormControl";
import { sendReadingList } from "../page/services";
import { LoadingButton } from "../ui/LoadingButton";
import { Entity, QuestionMetadata } from "@devographics/types";
import QuestionLabel from "../form/QuestionLabel";

const cutoff = 3;

export const ReadingList = (
  props: Pick<FormInputProps, "edition" | "response">
) => {
  const { edition, response } = props;
  const allEntities = getEditionEntities(edition);

  const readingList = response?.readingList;

  const [showMore, setShowMore] = useState(false);

  if (!readingList || readingList.length === 0) {
    return (
      <div className="reading-list reading-list-results">
        <h5 className="reading-list-title">
          <FormattedMessage id="readinglist.title" />
        </h5>
        <FormattedMessage id="readinglist.empty" />
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
          <FormattedMessage id="readinglist.title" />
        </h5>
        <p className="reading-list-description">
          <FormattedMessage id="readinglist.results" />
        </p>
        <div className="reading-list-items">
          {cutoffReadingList.map((itemId) => {
            const entity = allEntities.find((e) => e.id === itemId);
            return entity ? (
              <ListItem key={itemId} itemId={itemId} entity={entity} />
            ) : null;
          })}
          {hasTooManyItems && (
            <div className="reading-list-show-more">
              <Button
                className="form-show-more"
                onClick={() => {
                  console.log(showMore);
                  setShowMore((showMore) => !showMore);
                }}
              >
                <FormattedMessage
                  id={showMore ? "forms.less_options" : "forms.more_options"}
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

  if (!question) {
    return null;
  }

  const description = descriptionHtml || descriptionClean;
  return (
    <div className="reading-list-item">
      <h5 className="reading-list-item-title">
        {question ? (
          <QuestionLabel section={question.section} question={question} />
        ) : (
          <EntityLabel entity={entity} />
        )}
        <ul className="reading-list-item-links">
          {mdn && <LinkItem url={mdn.url} label="MDN" />}
          {github?.url && <LinkItem url={github.url} label="GitHub" />}
          {w3c?.url && <LinkItem url={w3c.url} label="w3c" />}
          {caniuse?.url && <LinkItem url={caniuse.url} label="CanIUse" />}
          {homepage && (
            <LinkItem
              url={homepage.url}
              label={<FormattedMessage id="readinglist.homepage_link" />}
            />
          )}
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
          {resources.map(({ title, url }) => (
            <li key={url}>
              <a href={url}>{title}</a>
            </li>
          ))}
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
}: Pick<FormInputProps, "edition" | "response">) => {
  const localStorageEmail =
    (typeof localStorage !== "undefined" && localStorage.getItem("email")) ||
    "";
  const [email, setEmail] = useState(localStorageEmail);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorResponse, setErrorResponse] = useState();
  const intl = useIntlContext();

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
      captureException(res.error);
      setErrorResponse(res.error);
    } else {
      setShowSuccess(true);
    }
    setLoading(false);
  };
  return (
    <div className="reading-list-send">
      <p className="reading-list-send-title">
        <FormattedMessage id="readinglist.receive_copy" />
      </p>
      <div className="reading-list-form">
        <FormControl
          placeholder={intl.formatMessage({ id: "user_info.email" })}
          type="email"
          value={email}
          onChange={handleChange}
        />
        <LoadingButton loading={loading} onClick={handleSubmit}>
          <FormattedMessage id="readinglist.send_by_email" />
        </LoadingButton>
      </div>
      {errorResponse && (
        <div className="survey-message survey-error">ERROR</div>
      )}
      {showSuccess && (
        <div className="survey-message survey-success">
          <FormattedMessage id="readinglist.email_sent" />
        </div>
      )}
    </div>
  );
};

export default ReadingList;
