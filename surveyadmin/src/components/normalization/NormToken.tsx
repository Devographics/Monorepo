import { useEffect, useRef, useState } from "react";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { FieldValue, ResponseId } from "./Fields";

const NormToken = ({
  id,
  responses,
}: {
  id: string;
  responses: NormalizationResponse[];
}) => {
  const [showModal, setShowModal] = useState(false);

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
          id={id}
          responses={responses}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      )}
    </>
  );
};

const Dialog = ({
  id,
  responses,
  showModal,
  setShowModal,
}: {
  id: string;
  responses: NormalizationResponse[];

  showModal: boolean;
  setShowModal: React.Dispatch<boolean>;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (articleRef.current && !articleRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };
    if (showModal) {
      document.addEventListener("click", checkIfClickedOutside);
    }
    return () => {
      document.removeEventListener("click", checkIfClickedOutside);
    };
  }, [showModal]);

  const tokenResponses = responses.filter((r) =>
    r?.normalizedValue?.includes(id)
  );

  return (
    <dialog open ref={dialogRef}>
      <article ref={articleRef}>
        <header>
          <a
            href="#close"
            aria-label="Close"
            className="close"
            onClick={(e) => {
              e.preventDefault();
              setShowModal(false);
            }}
          ></a>
          Answers matching <code>{id}</code> ({tokenResponses.length})
        </header>
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
              const { value, normalizedValue, patterns, responseId } = response;
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
      </article>
    </dialog>
  );
};

export default NormToken;
