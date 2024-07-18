"use client";
import { useEffect, useRef } from "react";

export const Dialog = ({
  children,
  showModal,
  setShowModal,
  header,
  onOpen,
  onClose,
  className = "",
}: {
  children;
  showModal: boolean;
  setShowModal: React.Dispatch<boolean>;
  header?;
  onOpen?: () => void;
  onClose?: () => void;
  className?: string;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (articleRef.current && !articleRef.current.contains(e.target)) {
        setShowModal(false);
        onClose && onClose();
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
    <dialog open ref={dialogRef} className={className}>
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
                onClose && onClose();
              }}
            ></a>
            {header}
          </header>
        )}
        {children}
      </article>
    </dialog>
  ) : null;
};

export default Dialog;
