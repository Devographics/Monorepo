"use client";
import sortBy from "lodash/sortBy";
import sumBy from "lodash/sumBy";
import { useState } from "react";
import {
  NormalizedField,
  NormalizedDocumentMetadata,
  NormalizeInBulkResult,
} from "~/lib/normalization/types";

const errorColor = "#cf2710";

export const NormalizationResult = ({
  normalizedDocuments,
  unnormalizedDocuments,
  emptyDocuments,
  errorDocuments,
  duration,
  discardedCount,
  showQuestionId = true,
  isSimulation,
  errorCount,
}: NormalizeInBulkResult & {
  showQuestionId?: boolean;
}) => {
  const [showResult, setShowResult] = useState(true);

  return (
    showResult && (
      <div>
        {/* <p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowResult(false);
            }}
          >
            Hide
          </a>
        </p> */}
        <div>
          <table style={{ border: "1px solid #ccc" }}>
            <thead>
              <tr>
                {isSimulation && (
                  <th>
                    <mark>Simulation</mark>
                  </th>
                )}
                <th>
                  Done in <strong>{duration}s</strong>
                </th>
                <th>
                  <strong>{normalizedDocuments.length}</strong> normalized
                  documents
                </th>
                <th>
                  <strong>
                    {sumBy(
                      normalizedDocuments,
                      (doc) => doc?.normalizedFieldsCount || 0
                    )}
                  </strong>{" "}
                  total normalized fields
                </th>
                <th>
                  <strong>{discardedCount}</strong> empty or invalid documents
                  dicarded
                </th>
                <th
                  style={{ ...(errorCount > 0 ? { color: errorColor } : {}) }}
                >
                  <strong>{errorCount}</strong> errors
                </th>
              </tr>
            </thead>
          </table>
        </div>

        <DocumentGroup
          documents={errorDocuments}
          label="Error Documents"
          isEmpty={true}
          defaultShow={true}
          isError={true}
        />
        <DocumentGroup
          documents={normalizedDocuments}
          label="Normalized Documents"
          showQuestionId={showQuestionId}
          defaultShow={false}
        />
        <DocumentGroup
          documents={unnormalizedDocuments}
          label="Unnormalized Documents"
          showQuestionId={showQuestionId}
          defaultShow={false}
        />
        <DocumentGroup
          documents={emptyDocuments}
          label="Empty Documents"
          isEmpty={true}
          defaultShow={false}
        />
      </div>
    )
  );
};

const DocumentGroup = ({
  documents,
  label,
  showQuestionId = true,
  isEmpty = false,
  isError = false,
  defaultShow = true,
}: {
  documents: NormalizedDocumentMetadata[];
  label: string;
  showQuestionId?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  defaultShow?: boolean;
}) => {
  const [show, setShow] = useState(defaultShow);
  return documents.length > 0 ? (
    <>
      <h3 style={{ ...(isError ? { color: errorColor } : {}) }}>
        {label} ({documents.length}){" "}
        <a
          href="#"
          role="button"
          onClick={(e) => {
            e.preventDefault();
            setShow((show) => !show);
          }}
        >
          {show ? "Hide" : "Show"}
        </a>
      </h3>
      {show && (
        <>
          {isEmpty ? (
            documents.map((doc) => (
              <span key={doc.responseId}>
                <code>{doc.responseId}</code>{" "}
              </span>
            ))
          ) : (
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>ResponseId</th>
                  <th>Contents</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <NormDocument
                    {...doc}
                    index={index}
                    showQuestionId={showQuestionId}
                    key={doc.responseId}
                  />
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </>
  ) : null;
};

const NormDocument = ({
  errors,
  responseId,
  normalizedFieldsCount,
  normalizedFields,
  showQuestionId,
  index,
}: NormalizedDocumentMetadata & { index: number; showQuestionId: boolean }) => {
  return (
    <tr>
      <th>{index + 1}.</th>
      <th>
        <code>{responseId}</code>
      </th>
      <td>
        {normalizedFields?.map((field) => (
          <NormField
            {...field}
            showQuestionId={showQuestionId}
            key={field.fieldPath}
          />
        ))}
      </td>
    </tr>
  );
};

const NormField = ({
  fieldPath,
  raw,
  questionId,
  value,
  normTokens,
  showQuestionId,
}: NormalizedField & { showQuestionId: boolean }) => {
  return (
    <div>
      {normTokens && normTokens.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th colSpan={99}>
                {showQuestionId && <strong>{questionId}: </strong>}{" "}
                <code id="Raw response">{raw}</code>
              </th>
            </tr>
            <tr>
              <th>Matched Token</th>
              <th>Matched Text</th>
              <th>Pattern</th>
            </tr>
          </thead>
          <tbody>
            {normTokens.map(({ id, pattern, match }, i) => (
              <tr key={i}>
                <td>
                  <mark>{id}</mark>
                </td>
                <td>{match}</td>
                <td>{pattern}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table style={{ background: "rgba(0,0,0,0.05)" }}>
          <thead>
            <tr>
              <th>
                {showQuestionId && <strong>{questionId}:</strong>}
                <em title="No matching normalization tokens found.">{raw}</em>
              </th>
            </tr>
          </thead>
        </table>
      )}
    </div>
  );
};
