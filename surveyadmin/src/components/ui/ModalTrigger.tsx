"use client";
import { Dispatch, SetStateAction, cloneElement, useState } from "react";
import Dialog from "./Dialog";

export const ModalTrigger = ({
  isButton = true,
  className = "",
  dialogClassName = "",
  label,
  header,
  children,
  tooltip,
  onOpen,
  onClose,
  showModal: showModalProps,
  setShowModal: setShowModalProps,
}: {
  isButton?: boolean;
  className?: string;
  dialogClassName?: string;
  label: string;
  header?: React.ReactNode;
  children: JSX.Element;
  tooltip?: string;
  onOpen?: () => void;
  onClose?: () => void;
  showModal?: boolean;
  setShowModal?: Dispatch<SetStateAction<boolean>>;
}) => {
  const [showModalState, setShowModalState] = useState(false);

  // either work as controlled (via props) on uncontroller (via local state) component
  const showModal = showModalProps || showModalState;
  const setShowModal = setShowModalProps || setShowModalState;

  const triggerProps = {};
  if (tooltip) {
    triggerProps["data-tooltip"] = tooltip;
  }

  const TriggerElement = isButton ? "button" : "a";

  const childrenWithProps = cloneElement(children, { showModal, setShowModal });

  return (
    <>
      <TriggerElement
        {...triggerProps}
        role={isButton ? "button" : "link"}
        className={className}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setShowModal(!showModal);
          if (showModal) {
            onClose && onClose();
          } else {
            onOpen && onOpen();
          }
        }}
      >
        {label}
      </TriggerElement>
      <Dialog
        showModal={showModal}
        setShowModal={setShowModal}
        header={header}
        onOpen={onOpen}
        onClose={onClose}
        className={dialogClassName}
      >
        {childrenWithProps}
      </Dialog>
    </>
  );
};

export default ModalTrigger;
