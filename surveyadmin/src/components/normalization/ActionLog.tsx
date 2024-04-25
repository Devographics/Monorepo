"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ModalTrigger from "../ui/ModalTrigger";
import { ActionLogItem, CommonNormalizationProps } from "./NormalizeQuestion";
import {
  NormalizedDocumentMetadata,
  NormalizedField,
} from "~/lib/normalization/types";
import { NormTokenAction } from "./NormTokenAction";
import { NormalizationMetadata } from "@devographics/types";
import FieldValue from "./FieldValue";

export const ActionLog = ({
  actionLog,
  showActionLog,
  setShowActionLog,
  setTokenFilter,
}: {
  actionLog: ActionLogItem[];
  showActionLog: boolean;
  setShowActionLog: Dispatch<SetStateAction<boolean>>;
  setTokenFilter: CommonNormalizationProps["setTokenFilter"];
}) => {
  const ref = useRef<HTMLDivElement>(null);
  // console.log(actionLog);

  const scrollToBottom = () => {
    const scroll = ref.current;
    if (scroll) {
      scroll.scrollTop = scroll.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  });

  return (
    <div>
      <ModalTrigger
        isButton={false}
        label="📒 View Action Log…"
        tooltip="View log of past actions"
        header={<span>Action Log</span>}
        showModal={showActionLog}
        setShowModal={setShowActionLog}
        dialogClassName="action-log-modal"
      >
        <div ref={ref} className="action-log-contents">
          {actionLog.map((action, i) => (
            <LogItem
              key={i}
              action={action}
              setTokenFilter={setTokenFilter}
              index={i}
              allActions={actionLog}
            />
          ))}
        </div>
      </ModalTrigger>
    </div>
  );
};

function formatReadableDateTime(date) {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  return date.toLocaleString("en-US", options);
}

const getSummary = (action: ActionLogItem) => {
  const { type, payload } = action;
  if (type === "normalization") {
    const normalizedCount = payload?.data?.normalizedDocuments.length || 0;
    const totalCount = payload?.data?.totalDocumentCount || 0;
    return `Normalized ${totalCount} document${totalCount > 1 ? "s" : ""}`;
  }
};

const LogItem = ({
  action,
  setTokenFilter,
  index,
  allActions,
}: {
  action: ActionLogItem;
  setTokenFilter: CommonNormalizationProps["setTokenFilter"];
  index: number;
  allActions: ActionLogItem[];
}) => {
  const { type, payload, timestamp } = action;
  const { data } = payload;
  const {
    totalDocumentCount,
    duration,
    normalizedDocuments,
    partiallyMatchedDocuments,
    unmatchedDocuments,
  } = data || {};
  const [showDetails, setShowDetails] = useState(
    index === allActions.length - 1
  );
  return (
    <div>
      <details className="actionlog-item" open={showDetails}>
        <summary
          onClick={(e) => {
            e.preventDefault();
            setShowDetails(!showDetails);
          }}
        >
          <div>
            {formatReadableDateTime(new Date(timestamp))}{" "}
            <strong>{getSummary(action)}</strong>
          </div>
        </summary>
        {showDetails && (
          <>
            <DocumentList
              label="Fully Normalized"
              documents={normalizedDocuments}
              setTokenFilter={setTokenFilter}
            />
            <DocumentList
              label="Partially Normalized"
              documents={partiallyMatchedDocuments}
              setTokenFilter={setTokenFilter}
            />
            <DocumentList
              label="Unmatched"
              documents={unmatchedDocuments}
              setTokenFilter={setTokenFilter}
            />
          </>
        )}
      </details>
    </div>
  );
};

const DocumentList = ({ label, documents, setTokenFilter }) => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <details open={showDetails}>
      <summary
        onClick={(e) => {
          e.preventDefault();
          setShowDetails(!showDetails);
        }}
      >
        <h5>
          {label} ({documents?.length})
        </h5>
      </summary>
      {showDetails && (
        <div>
          <table>
            <tbody>
              {documents?.map((document, index) => (
                <DocumentItem
                  key={document.responseId}
                  document={document}
                  setTokenFilter={setTokenFilter}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </details>
  );
};

const DocumentItem = ({
  document,
  setTokenFilter,
  index,
}: {
  document: NormalizedDocumentMetadata;
  setTokenFilter: CommonNormalizationProps["setTokenFilter"];
  index: number;
}) => {
  const { responseId, normalizedFields, normalizedResponseId, group } =
    document;
  const allMetadataItems = normalizedFields
    ?.map((f) => f.metadata?.map((m) => ({ ...f, ...m })))
    .flat();
  return (
    <>
      <tr>
        <th colSpan={99}>
          <strong>
            <span>{index + 1}.</span> <code>{responseId}</code>{" "}
            {/* <mark>{group}</mark> */}
          </strong>
        </th>
      </tr>
      {allMetadataItems?.map(
        (field: NormalizedField & NormalizationMetadata) => {
          const { questionId, value, raw, tokens } = field;
          return (
            <tr key={raw}>
              <td>{questionId}</td>
              <td>
                <FieldValue raw={raw} tokens={tokens} />
              </td>
              <td>
                {tokens?.map((token) => (
                  <NormTokenAction
                    key={token.id}
                    id={token.id}
                    setTokenFilter={setTokenFilter}
                  />
                ))}
              </td>
            </tr>
          );
        }
      )}
    </>
  );
};
