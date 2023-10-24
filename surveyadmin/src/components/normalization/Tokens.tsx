"use client";
import { useState } from "react";
import {
  EditionMetadata,
  ResponseData,
  SurveyMetadata,
  Entity,
} from "@devographics/types";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import type { QuestionWithSection } from "~/lib/normalization/types";
import { getFormPaths } from "@devographics/templates";
import {
  getAllResponsesSelector,
  getResponsesSelector,
  getUnnormalizedResponsesSelector,
} from "~/lib/normalization/helpers/getSelectors";
import Dialog from "./Dialog";

const Tokens = ({
  survey,
  edition,
  question,
  responsesCount,
  responses,
  normalizedResponses,
  unnormalizedResponses,
  questionData,
  entities,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  responsesCount: number;
  responses: NormalizationResponse[];
  normalizedResponses: NormalizationResponse[];
  unnormalizedResponses: NormalizationResponse[];
  questionData: ResponseData;
  entities: Entity[];
}) => {
  const [showTokens, setShowTokens] = useState(false);

  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  })!;

  const allTags = [question.id, ...(question?.matchTags || [])];

  return (
    <div>
      <a
        role="button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setShowTokens(!showTokens);
        }}
      >
        Tokens
      </a>
      <Dialog
        showModal={showTokens}
        setShowModal={setShowTokens}
        header={
          <span>
            Tokens for <code>{question.id}</code>
          </span>
        }
      >
        <ul>
          <li>
            {questionObject.matchType === "multiple" ? (
              <span>
                <strong>Multiple tokens</strong> per answer can be matched.
              </span>
            ) : (
              <span>
                Only a <strong>single token</strong> per answer can be matched.{" "}
              </span>
            )}
          </li>
          <li>
            Match tags that are higher up in the list are given higher priority.
          </li>
          <li>
            All entities match their own ID by default (with underscores
            matching spaces or dashes).{" "}
          </li>
        </ul>

        {allTags?.map((tag) => (
          <TagItem key={tag} entities={entities} tag={tag} />
        ))}
      </Dialog>
    </div>
  );
};

const TagItem = ({ tag, entities }) => {
  const tagEntities = entities.filter((e) => e?.tags?.includes(tag));
  return (
    <div className="tag-item">
      <h5 className="tag-item-heading">
        <code>{tag}</code> ({tagEntities.length})
      </h5>
      {tagEntities.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Entity ID</th>
              <th>Patterns</th>
              <th>Other Tags</th>
            </tr>
          </thead>
          <tbody>
            {tagEntities.map((entity) => (
              <EntityItem key={entity.id} entity={entity} mainTag={tag} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
const EntityItem = ({ entity, mainTag }) => {
  const { id, patterns, tags } = entity;
  const otherTags = tags.filter((t) => t !== mainTag);
  return (
    <tr key={id}>
      <td>{id}</td>
      <td>
        <div className="match-patterns">
          {patterns?.map((pattern) => (
            <span key={pattern}>
              <code>{pattern}</code>{" "}
            </span>
          ))}
        </div>
      </td>
      <td>
        <div className="match-tags">
          {otherTags && (
            <ul>
              {otherTags?.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
      </td>
    </tr>
  );
};
export default Tokens;
