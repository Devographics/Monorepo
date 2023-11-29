import { useEffect, useRef, useState } from "react";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { ResponseId } from "./Fields";
import Dialog from "./Dialog";
import { FieldValue } from "./FieldValue";
import { splitResponses } from "~/lib/normalization/helpers/splitResponses";

const NormToken = ({
  id,
  responses,
  pattern,
  variant = "normal",
}: {
  id: string;
  responses: NormalizationResponse[];
  pattern?: string;
  variant?: "normal" | "custom";
}) => {
  const [showModal, setShowModal] = useState(false);

  const { normalizedAnswers } = splitResponses(responses);

  const tokenAnswers = normalizedAnswers?.filter((a) =>
    a?.tokens.map((t) => t.id)?.includes(id)
  );

  if (pattern === "custom_normalization") {
    variant = "custom";
  }

  return (
    <>
      <span data-tooltip={pattern}>
        <a
          role="button"
          href="#"
          className={`normalization-token normalization-token-${variant}`}
          onClick={(e) => {
            e.preventDefault();
            setShowModal(true);
          }}
        >
          <code>{id}</code>
        </a>
      </span>

      {showModal && (
        <Dialog
          showModal={showModal}
          setShowModal={setShowModal}
          header={
            <span>
              Answers matching <code>{id}</code> ({tokenAnswers.length})
            </span>
          }
        >
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Answer</th>
                <th>ResponseId</th>
              </tr>
            </thead>
            <tbody>
              {tokenAnswers?.map((response, i) => {
                const { raw, tokens, responseId } = response;
                return (
                  <tr key={i}>
                    <td>{i + 1}.</td>
                    <td>
                      <FieldValue
                        currentTokenId={id}
                        raw={raw}
                        tokens={tokens}
                      />
                    </td>
                    <td>
                      <ResponseId id={responseId} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Dialog>
      )}
    </>
  );
};

export default NormToken;
