import { useState } from "react";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { ResponseId } from "./Answers";
import Dialog from "../ui/Dialog";
import { FieldValue } from "./FieldValue";
import { splitResponses } from "~/lib/normalization/helpers/splitResponses";
import { Entity } from "@devographics/types";

export interface NormTokenProps {
  id: string;
  responses: NormalizationResponse[];
  pattern?: string;
  entities: Entity[];
}

/*

Factor out common stuff in hook

*/
export const useNormTokenStuff = (props: NormTokenProps) => {
  const { id, responses, entities } = props;
  const entity = entities.find((e) => e.id === id);
  const [showModal, setShowModal] = useState(false);
  const { normalizedAnswers } = splitResponses(responses);
  const tokenAnswers = normalizedAnswers?.filter((a) =>
    a?.tokens.map((t) => t.id)?.includes(id)
  );
  return { entity, showModal, setShowModal, tokenAnswers };
};

/*

Static norm token

*/
export const NormToken = (props: NormTokenProps) => {
  const { id } = props;
  const { entity, showModal, setShowModal, tokenAnswers } =
    useNormTokenStuff(props);
  return (
    <>
      <code className={`normalization-token`}>
        <span
          onClick={(e) => {
            e.preventDefault();
            setShowModal(true);
          }}
          data-tooltip={entity?.descriptionClean}
        >
          {id}
        </span>
      </code>
      {showModal && (
        <Modal {...{ showModal, setShowModal, id, tokenAnswers }} />
      )}
    </>
  );
};

/*

Modal showing all matching answers

*/
export const Modal = ({ showModal, setShowModal, id, tokenAnswers }) => {
  return (
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
                  <FieldValue currentTokenId={id} raw={raw} tokens={tokens} />
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
  );
};
