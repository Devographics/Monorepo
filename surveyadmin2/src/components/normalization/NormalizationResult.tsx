"use client";
import sortBy from "lodash/sortBy";
import sumBy from "lodash/sumBy";
import { useState } from "react";
import {
  NormalizedField,
  NormalizedDocumentMetadata,
  NormalizeInBulkResult,
} from "~/lib/normalization/types";
import { defaultSegmentSize } from "./hooks";

const errorColor = "#cf2710";

export const NormalizationResult = ({
  normalizedDocuments,
  unmatchedDocuments,
  unnormalizableDocuments,
  errorDocuments,
  emptyDocuments,
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
                  <strong>{emptyDocuments.length}</strong> empty documents
                </th>
                <th>
                  <strong>
                    {Math.round(
                      (emptyDocuments.length * 100) / defaultSegmentSize
                    )}
                    %
                  </strong>{" "}
                  discard rate
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
          description="Documents that triggered one or more errors."
          defaultShow={true}
          isError={true}
        />
        <DocumentGroup
          documents={normalizedDocuments}
          label="Normalized Documents"
          description="Documents where a matching token was found for every normalizable question parsed."
          showQuestionId={showQuestionId}
          defaultShow={false}
        />
        <DocumentGroup
          documents={unmatchedDocuments}
          label="Unmatched Documents"
          description="Documents that contained unmatched questions."
          showQuestionId={showQuestionId}
          defaultShow={false}
        />
        <DocumentGroup
          documents={unnormalizableDocuments}
          label="Unnormalizable Documents"
          description="Documents that did not contain any fields requiring normalization."
          onlyId={true}
          defaultShow={false}
        />
        <DocumentGroup
          documents={emptyDocuments}
          label="Empty Documents"
          description="Documents were discarded for being empty."
          onlyId={true}
          defaultShow={false}
        />
      </div>
    )
  );
};

const DocumentGroup = ({
  documents,
  label,
  description,
  showQuestionId = true,
  onlyId = false,
  isError = false,
  defaultShow = true,
}: {
  documents: NormalizedDocumentMetadata[];
  label: string;
  description: string;
  showQuestionId?: boolean;
  onlyId?: boolean;
  isError?: boolean;
  defaultShow?: boolean;
}) => {
  const [show, setShow] = useState(defaultShow);
  return documents.length > 0 ? (
    <>
      <h4 style={{ ...(isError ? { color: errorColor } : {}) }}>
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
      </h4>
      {show && (
        <>
          <p>{description}</p>

          {onlyId ? (
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
                  <th>{isError ? "Errors" : "Contents"}</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <NormDocument
                    {...doc}
                    index={index}
                    showQuestionId={showQuestionId}
                    key={doc.responseId}
                    isError={isError}
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
  isError,
}: NormalizedDocumentMetadata & {
  index: number;
  showQuestionId: boolean;
  isError: boolean;
}) => {
  return (
    <tr>
      <th style={{ verticalAlign: "top" }}>{index + 1}.</th>
      <th style={{ verticalAlign: "top" }}>
        <code>{responseId}</code>
      </th>
      <td>
        {isError ? (
          <ul>
            {errors?.map((error) => (
              <li key={error}>
                <code>{error}</code>
              </li>
            ))}
          </ul>
        ) : (
          normalizedFields?.map((field) => (
            <NormField
              {...field}
              showQuestionId={showQuestionId}
              key={field.fieldPath}
            />
          ))
        )}
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
