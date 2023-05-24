"use client";
import { useState, useEffect, useRef } from "react";
import { FormattedMessage } from "../common/FormattedMessage";
import { FormInputProps } from "../form/typings";
import { getEditionQuestions } from "~/lib/surveys/helpers";
import EntityLabel from "~/components/common/EntityLabel";
import { Button } from "~/components/ui/Button";

export const ReadingList = (
  props: Pick<FormInputProps, "edition" | "response">
) => {
  const { edition, response } = props;
  const allQuestions = getEditionQuestions(edition);

  const readingList = response?.readingList;

  return (
    <div className="reading-list reading-list-results">
      <h5 className="reading-list-title">
        <FormattedMessage id="readinglist.title" />
      </h5>
      <div className="reading-list-description">
        <FormattedMessage id="readinglist.results" />
      </div>
      <div className="reading-list-items">
        {readingList.map((itemId) => (
          <ListItem
            key={itemId}
            itemId={itemId}
            question={allQuestions.find((q) => q.id === itemId)}
          />
        ))}
      </div>
    </div>
  );
};

const ListItem = ({ itemId, question }) => {
  const { entity } = question;
  const { mdn, github, homepage } = entity;
  console.log(entity);

  return (
    <div className="reading-list-item">
      <EntityLabel entity={entity} />
      {mdn?.summary && <div>{mdn.summary}</div>}
      <ul>
        {mdn && (
          <li>
            <a href={mdn.url}>MDN</a>
          </li>
        )}
        {github.url && (
          <li>
            <a href={github.url}>GitHub</a>
          </li>
        )}
        {homepage && (
          <li>
            <a href={homepage.url}>Homepage</a>
          </li>
        )}
      </ul>
    </div>
  );
};

export default ReadingList;
