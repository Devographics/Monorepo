import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { ResponseId } from "./Answers";
import Dialog from "./Dialog";
import { FieldValue } from "./FieldValue";
import { splitResponses } from "~/lib/normalization/helpers/splitResponses";

interface NormTokenProps {
  id: string;
  responses: NormalizationResponse[];
  pattern?: string;
  action?: "default" | "add" | "remove";
  addToken?: (string) => void;
  removeToken?: (string) => void;
  isCustom?: boolean;
  isIncluded?: boolean;
}

const NormToken = ({
  id,
  responses,
  pattern,
  action = "default",
  addToken,
  removeToken,
  isCustom = false,
  isIncluded = false,
}: NormTokenProps) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { normalizedAnswers } = splitResponses(responses);

  const tokenAnswers = normalizedAnswers?.filter((a) =>
    a?.tokens.map((t) => t.id)?.includes(id)
  );

  let actionComponent = <Default setShowModal={setShowModal} id={id} />;
  if (isCustom && addToken && removeToken && !isIncluded) {
    const actionProps = {
      loading,
      setLoading,
      setShowModal,
      id,
      addToken,
      removeToken,
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
        style={{ opacity: isIncluded ? 0.5 : 1 }}
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
}: {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  id: string;
}) => {
  return (
    <code
      onClick={(e) => {
        e.preventDefault();
        setShowModal(true);
      }}
      data-tooltip="View Matching Answers…"
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
}

const AddToken = ({
  loading,
  setLoading,
  setShowModal,
  addToken,
  id,
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
        data-tooltip="View Matching Answers…"
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
        data-tooltip="View Matching Answers…"
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
