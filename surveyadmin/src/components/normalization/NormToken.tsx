import { useEffect, useRef, useState } from "react";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { FieldValue, ResponseId } from "./Fields";
import Dialog from "./Dialog";

const NormToken = ({
  id,
  responses,
}: {
  id: string;
  responses: NormalizationResponse[];
}) => {
  const [showModal, setShowModal] = useState(false);

  const tokenResponses = responses.filter((r) =>
    r?.normalizedValue?.includes(id)
  );
  return (
    <>
      <a
        role="button"
        href="#"
        className="normalization-token"
        onClick={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
      >
        <code>{id}</code>
      </a>

      {showModal && (
        <Dialog
          showModal={showModal}
          setShowModal={setShowModal}
          header={
            <span>
              Answers matching <code>{id}</code> ({tokenResponses.length})
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
              {tokenResponses?.map((response, i) => {
                const { value, normalizedValue, patterns, responseId } =
                  response;
                return (
                  <tr key={i}>
                    <td>{i + 1}.</td>
                    <td>
                      <FieldValue
                        currentTokenId={id}
                        value={value}
                        normalizedValue={normalizedValue}
                        patterns={patterns}
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
