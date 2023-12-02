import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { ResponseId } from "./Answers";
import Dialog from "./Dialog";
import { FieldValue } from "./FieldValue";
import { splitResponses } from "~/lib/normalization/helpers/splitResponses";
import { Entity } from "@devographics/types";

interface NormTokenProps {
  id: string;
  responses: NormalizationResponse[];
  pattern?: string;
  action?: "default" | "add" | "remove";
  addToken?: (string) => void;
  removeToken?: (string) => void;
  isCustom?: boolean;
  isIncluded?: boolean;
  entities: Entity[];
}

const NormToken = ({
  id,
  responses,
  pattern,
  action = "default",
  addToken,
  removeToken,
  isCustom = false,
  entities,
}: NormTokenProps) => {
  const entity = entities.find((e) => e.id === id);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { normalizedAnswers } = splitResponses(responses);

  const tokenAnswers = normalizedAnswers?.filter((a) =>
    a?.tokens.map((t) => t.id)?.includes(id)
  );

  let actionComponent = (
    <Default setShowModal={setShowModal} id={id} entity={entity} />
  );
  if (isCustom && addToken && removeToken) {
    const actionProps = {
      loading,
      setLoading,
      setShowModal,
      id,
      addToken,
      removeToken,
      entity,
    };
    if (action === "add") {
      actionComponent = <AddToken {...actionProps} />;
    } else if (action === "remove") {
      actionComponent = <RemoveToken {...actionProps} />;
    }
  }

  return (
    <>
      <span
        style={{ opacity: action === "add" ? 0.5 : 1 }}
        className={isCustom ? `normalization-token-custom` : ""}
      >
        {actionComponent}
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

const Default = ({
  setShowModal,
  id,
  entity,
}: {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  id: string;
  entity?: Entity;
}) => {
  return (
    <code
      onClick={(e) => {
        e.preventDefault();
        setShowModal(true);
      }}
      data-tooltip={entity?.descriptionClean}
    >
      {id}
    </code>
  );
};

interface ActionProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  id: string;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  addToken: (string) => void;
  removeToken: (string) => void;
  entity?: Entity;
}

const AddToken = ({
  loading,
  setLoading,
  setShowModal,
  addToken,
  id,
  entity,
}: ActionProps) => {
  return (
    <code
      className={`normalization-token normalization-token-custom`}
      aria-busy={loading}
    >
      <span
        onClick={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
        data-tooltip={entity?.descriptionClean}
      >
        {id}
      </span>
      <span
        className="token-action"
        data-tooltip="Add Token"
        onClick={async (e) => {
          e.preventDefault();
          setLoading(true);
          await addToken(id);
          setLoading(false);
        }}
      >
        ➕
      </span>
    </code>
  );
};

const RemoveToken = ({
  loading,
  setLoading,
  setShowModal,
  removeToken,
  id,
  entity,
}: ActionProps) => {
  return (
    <code
      className={`normalization-token normalization-token-custom`}
      aria-busy={loading}
    >
      <span
        onClick={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
        data-tooltip={entity?.descriptionClean}
      >
        {id}
      </span>
      <span
        className="token-action"
        data-tooltip="Remove Token"
        onClick={async (e) => {
          e.preventDefault();
          setLoading(true);
          await removeToken(id);
          setLoading(false);
        }}
      >
        ➖
      </span>
    </code>
  );
};

export default NormToken;
