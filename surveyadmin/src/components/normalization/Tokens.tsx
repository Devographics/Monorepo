"use client";
import { useState } from "react";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import {
  EditionMetadata,
  SurveyMetadata,
  Entity,
  QuestionWithSection,
} from "@devographics/types";
import sortBy from "lodash/sortBy";
import ModalTrigger from "../ui/ModalTrigger";
import uniq from "lodash/uniq";

const Tokens = ({
  survey,
  edition,
  question,
  entities,
  isButton = true,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  entities: Entity[];
  isButton?: boolean;
}) => {
  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  })!;

  const allTags = [question.id, ...(question?.matchTags || [])];

  const allTokens = uniq(
    allTags
      .map((tag) =>
        entities.filter((e) => e?.tags?.includes(tag)).map((e) => e.id)
      )
      .flat()
  );

  return (
    <ModalTrigger
      isButton={false}
      label="🏷️ Tags & Tokens…"
      tooltip="View entity tokens for current question"
      header={
        <span>
          Tokens for <code>{question.id}</code>
        </span>
      }
    >
      <div>
        <h3>Question Match Tags</h3>
        <ul>
          <li>
            A question's match tags are defined in the survey outline under the
            <code>matchTags</code> property.
          </li>
          <li>
            A question's own <code>id</code> is automatically added as a match
            tag.
          </li>
          <li>
            A question with the match tag <code>foo</code> will consider all
            entities that contain <code>foo</code>
            under their <code>tags</code> property; or are defined in the{" "}
            <code>foo.yml</code> file.
          </li>
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
            Entity ids are automatically added as patterns (with underscores
            matching spaces or dashes).
          </li>
        </ul>

        {allTags?.map((tag) => (
          <TagItem key={tag} entities={entities} tag={tag} />
        ))}

        <p>
          <h3>All Entity Tokens ({allTokens.length})</h3>
          <textarea value={allTokens.join(", ")} readOnly />
        </p>
      </div>
    </ModalTrigger>
  );
};

const TagItem = ({ tag, entities }) => {
  const [showTokens, setShowTokens] = useState(false);
  const tagEntities = entities.filter((e) => e?.tags?.includes(tag));
  return (
    <div className="tag-item">
      <h5 className="tag-item-heading">
        <a
          href="#"
          role="button"
          onClick={(e) => {
            e.preventDefault();
            setShowTokens(!showTokens);
          }}
        >
          {tag}
        </a>{" "}
        ({tagEntities.length})
      </h5>
      {showTokens && tagEntities.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Entity ID</th>
              <th>Patterns</th>
              <th>Other Tags</th>
            </tr>
          </thead>
          <tbody>
            {sortBy(tagEntities, (e) => e.id).map((entity) => (
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
          <ul>
            <li>
              <code>{id}</code>
            </li>
            {patterns?.map((pattern) => (
              <li key={pattern}>
                <code>{pattern}</code>{" "}
              </li>
            ))}
          </ul>
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
