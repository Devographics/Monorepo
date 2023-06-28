"use client";
import sortBy from "lodash/sortBy";
import sumBy from "lodash/sumBy";
import { useState } from "react";
import {
  NormalizedField,
  NormalizedDocumentMetadata,
  NormalizeInBulkResult,
} from "~/lib/normalization/types";

export const NormalizationResult = ({
  normalizedDocuments,
  duration,
  discardedCount,
  showQuestionId = true,
}: NormalizeInBulkResult & {
  showQuestionId?: boolean;
}) => {
  const [showResult, setShowResult] = useState(true);
  const successDocs = normalizedDocuments.filter((doc) =>
    doc.normalizedFields?.some((field) => field.normTokens.length > 0)
  );
  const failureDocs = normalizedDocuments.filter(
    (doc) => !doc.normalizedFields?.some((field) => field.normTokens.length > 0)
  );
  return (
    showResult && (
      <div>
        <p>
          <a
            href="#"
            onClick={() => {
              setShowResult(false);
            }}
          >
            Hide
          </a>
        </p>
        <div>
          <ul>
            <li>
              Done in <strong>{duration}s</strong>
            </li>
            <li>
              <strong>{successDocs.length}</strong> documents containing
              normalizeable fields
            </li>
            <li>
              <strong>
                {sumBy(successDocs, (doc) => doc?.normalizedFieldsCount || 0)}
              </strong>{" "}
              total normalized fields
            </li>
            <li>
              <strong>{discardedCount}</strong> empty or invalid documents
              dicarded
            </li>
          </ul>
        </div>

        {successDocs.length > 0 && (
          <>
            <h3>Normalized Documents</h3>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>ResponseId</th>
                  <th>Matches</th>
                </tr>
              </thead>
              <tbody>
                {successDocs.map((doc, index) => (
                  <NormDocument
                    {...doc}
                    index={index}
                    showQuestionId={showQuestionId}
                    key={doc.responseId}
                  />
                ))}
              </tbody>
            </table>
          </>
        )}

        {failureDocs.length > 0 && (
          <>
            <h3>Unnormalized Documents</h3>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>ResponseId</th>
                  <th>Matches</th>
                </tr>
              </thead>
              <tbody>
                {failureDocs.map((doc, index) => (
                  <NormDocument
                    {...doc}
                    index={index}
                    showQuestionId={showQuestionId}
                    key={doc.responseId}
                  />
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    )
  );
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
