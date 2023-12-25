"use client";
import { Dispatch, Fragment, SetStateAction, useState } from "react";
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
import Details from "../ui/Details";
import { CommonNormalizationProps } from "./NormalizeQuestion";
import { usePresets } from "./hooks";
import without from "lodash/without";

const EMPTY_TAG = "EMPTY_TAG";

type Sort = "alphabetical" | "matches";

type Token = Entity & { tag: string; matchCount: number };

const Tokens = ({
  survey,
  edition,
  question,
  entities,
  tokenFilter,
  setTokenFilter,
  isButton = true,
  setVariant,
  allAnswers,
}: CommonNormalizationProps & {
  isButton?: boolean;
}) => {
  const [showModal, setShowModal] = useState(false);
  const [sort, setSort] = useState<Sort>("alphabetical");
  const [filterQuery, setFilterQuery] = useState("");

  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  })!;

  const allTags = [question.id, ...(question?.matchTags || [])];

  const allTokens = uniq(
    allTags
      .map((tag) => {
        const tagEntities = entities.filter((e) => e?.tags?.includes(tag));
        const emptyEntities = [{ id: EMPTY_TAG }];

        return (tagEntities.length > 0 ? tagEntities : emptyEntities)
          .map((e) => {
            const matchCount = allAnswers.filter((a) =>
              a.tokens?.map((t) => t.id).includes(e.id)
            ).length;
            return {
              ...e,
              matchCount,
              tag,
            };
          })
          .toSorted((a, b) => {
            if (sort === "alphabetical") {
              return a.id.localeCompare(b.id);
            } else if (sort === "matches") {
              return b.matchCount - a.matchCount;
            }
            return 1;
          });
      })
      .flat()
      .filter((token) => token.id.includes(filterQuery))
  ) as Array<Token>;

  const { enabledPresets, setEnabledPresets, customPresets, setCustomPresets } =
    usePresets({ edition, question });

  return (
    <ModalTrigger
      isButton={true}
      className="button-ghost"
      label={`🏷️ Tokens… ${tokenFilter ? `(${tokenFilter.length})` : ""}`}
      tooltip="View entity tokens for current question"
      header={
        <span>
          Tokens for <code>{question.id}</code>
        </span>
      }
      showModal={showModal}
      setShowModal={setShowModal}
    >
      <div>
        <MatchTagsDetails questionObject={questionObject} />
        <ExportDetails allTokens={allTokens} />
        <p className="tokens-actions">
          {/* <button
            className="button-ghost"
            onClick={(e) => {
              e.preventDefault();
              setTokenFilter(null);
            }}
          >
            Enable All
          </button> */}
          <div className="tokens-actions-sort">
            <button
              className="button-ghost"
              onClick={(e) => {
                e.preventDefault();
                setSort("alphabetical");
              }}
            >
              Sort Alphabetically
            </button>

            <button
              className="button-ghost"
              onClick={(e) => {
                e.preventDefault();
                setSort("matches");
              }}
            >
              Sort by Matches
            </button>

            <div className="control control-search">
              <input
                type="search"
                id="search"
                placeholder="Filter…"
                value={filterQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterQuery(value);
                  // setFilterQueryDebounced(value);
                }}
              />
            </div>
          </div>
          <div className="token-actions-deselect">
            <button
              className="button-ghost"
              onClick={(e) => {
                e.preventDefault();
                setTokenFilter(null);
              }}
            >
              Clear All Filters
            </button>

            <button
              className="button-ghost"
              onClick={(e) => {
                e.preventDefault();
                setEnabledPresets([]);
              }}
            >
              Clear Shortlist
            </button>
          </div>
        </p>
        <table className="tokens-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Matches</th>
              <th>Patterns</th>
              {/* <th>Other Tags</th> */}
              <th>Filter By</th>
              <th>Shortlist</th>
            </tr>
          </thead>
          <tbody>
            {allTokens.map((token, index) => (
              <Row
                key={`${token.id}_${index}`}
                {...{
                  token,
                  allTokens,
                  index,
                  entities,
                  tokenFilter,
                  setTokenFilter,
                  setVariant,
                  setShowModal,
                  enabledPresets,
                  setEnabledPresets,
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </ModalTrigger>
  );
};

interface RowProps {
  token: Token;
  allTokens: Token[];
  index: number;
  entities: Entity[];
  tokenFilter: CommonNormalizationProps["tokenFilter"];
  setTokenFilter: CommonNormalizationProps["setTokenFilter"];
  setVariant: Dispatch<SetStateAction<string>>;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  enabledPresets: string[];
  setEnabledPresets: Dispatch<SetStateAction<string[]>>;
}

const Row = (props: RowProps) => {
  const {
    token,
    allTokens,
    index,
    entities,
    tokenFilter,
    setTokenFilter,
    setVariant,
    setShowModal,
    enabledPresets,
    setEnabledPresets,
  } = props;
  const { id, parentId, tag, tags, patterns, matchCount } = token;

  const previousToken = allTokens[index - 1];
  const showMatchTag =
    index === 0 || (previousToken && previousToken.tag !== tag);
  const isEmptyTag = id === EMPTY_TAG;
  const otherTags = tags?.filter((t) => t !== tag);
  const isActive = tokenFilter?.includes(id);
  const isInShortList = enabledPresets.includes(id);

  const enableFilter = (id) => {
    setTokenFilter([...(tokenFilter || []), id]);
    setVariant("normalized");
  };

  const disableFilter = (id) => {
    const newTokens = (tokenFilter || []).filter((t) => t !== id);
    setTokenFilter(newTokens.length > 0 ? newTokens : null);
  };

  const enablePreset = (id) => {
    setEnabledPresets([...enabledPresets, id]);
  };

  const disablePreset = (id) => {
    setEnabledPresets(without(enabledPresets, id));
  };

  return (
    <Fragment>
      {showMatchTag && (
        <tr className="letter-heading letter-heading-tokens">
          <td colSpan={99}>
            <div className="letter-heading-inner">
              <h5>
                🏷️ {tag} (
                {allTokens.filter((t) => t.tags?.includes(tag)).length})
              </h5>
            </div>
          </td>
        </tr>
      )}
      <tr
        className={isActive ? "token-filter-active" : "token-filter-inactive"}
      >
        <td>
          {parentId && (
            <div>
              <span className="id id-parent">{parentId}</span>
            </div>
          )}

          <div>
            {parentId && "↳ "}
            <MainId
              id={id}
              setTokenFilter={setTokenFilter}
              setVariant={setVariant}
              setShowModal={setShowModal}
            />
          </div>
        </td>
        <td>{matchCount > 0 && <span>{matchCount}</span>}</td>
        <td>
          {!isEmptyTag && (
            <div className="patterns">
              <span>
                <code>{`{id}`}</code>
              </span>
              {patterns?.map((p, i) => (
                <span key={`${p}_${i}`}>
                  <code>{p}</code>
                </span>
              ))}
            </div>
          )}
        </td>

        {/* <td>
        <div className="match-tags">
          {otherTags && (
            <ul>
              {otherTags?.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
      </td> */}
        <td>
          {!isEmptyTag && (
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => {
                if (isActive) {
                  disableFilter(id);
                } else {
                  enableFilter(id);
                }
              }}
            />
          )}
        </td>
        <td>
          {!isEmptyTag && (
            <input
              type="checkbox"
              checked={isInShortList}
              onChange={(e) => {
                if (isInShortList) {
                  disablePreset(id);
                } else {
                  enablePreset(id);
                }
              }}
            />
          )}
        </td>
      </tr>
    </Fragment>
  );
};

const MainId = ({ id, setTokenFilter, setShowModal, setVariant }) => (
  <a
    data-tooltip={`Filter by ${id}`}
    href="#"
    className="id id-main"
    onClick={(e) => {
      e.preventDefault();
      setTokenFilter([id]);
      setVariant("normalized");
      setShowModal(false);
    }}
  >
    {id}
  </a>
);

export default Tokens;

const MatchTagsDetails = ({ questionObject }) => (
  <Details label="About Question Match Tags">
    <ul>
      <li>
        A question's match tags are defined in the survey outline under the
        <code>matchTags</code> property.
      </li>
      <li>
        A question's own <code>id</code> is automatically added as a match tag.
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
  </Details>
);

const ExportDetails = ({ allTokens }) => (
  <Details label={`Export entity tokens (${allTokens.length})`}>
    <textarea
      value={allTokens
        .filter((t) => t.id !== EMPTY_TAG)
        .map((t) => t.id)
        .join(", ")}
      readOnly
    />
  </Details>
);
