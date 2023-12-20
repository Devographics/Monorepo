"use client";
import { useState } from "react";
import Dialog from "./Dialog";

export const ModalTrigger = ({
  isButton = true,
  className = "",
  label,
  header,
  children,
  tooltip,
}: {
  isButton?: boolean;
  className?: string;
  label: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  tooltip?: string;
}) => {
  const [showModal, setShowModal] = useState(false);

  const divProps = {};
  if (tooltip) {
    divProps["data-tooltip"] = tooltip;
  }

  return (
    <div {...divProps}>
      <a
        role={isButton ? "button" : "link"}
        className={className}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setShowModal(!showModal);
        }}
      >
        {label}
      </a>
      <Dialog showModal={showModal} setShowModal={setShowModal} header={header}>
        {children}
      </Dialog>
    </div>
  );
};

export default ModalTrigger;
