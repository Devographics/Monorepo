import { useEffect, useRef } from "react";

export const Dialog = ({
  children,
  showModal,
  setShowModal,
  header,
}: {
  children;
  showModal: boolean;
  setShowModal: React.Dispatch<boolean>;
  header?;
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

  return showModal ? (
    <dialog open ref={dialogRef}>
      <article ref={articleRef}>
        {header && (
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
            {header}
          </header>
        )}
        <div>{children}</div>
      </article>
    </dialog>
  ) : null;
};

export default Dialog;
