// Note: these messages are now displayed from the AppLayout level

"use client";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { FormInputProps } from "./typings";
import Toast from "react-bootstrap/Toast";
import { FormattedMessage } from "../common/FormattedMessage";
import ToastContainer from "react-bootstrap/ToastContainer";

export interface Message {
  type: "error" | "success" | "info";
  header?: string;
  headerId?: string;
  headerValues?: any;
  extraInfo?: string;
  body?: string;
  bodyId?: string;
  bodyValues?: any;
}

export interface FormMessagesProps {
  stateStuff: {
    messages: Message[];
  };
}

const FormMessages = (props: FormMessagesProps) => {
  const { stateStuff } = props;
  const { messages } = stateStuff;
  useEffect(() => {}, [messages]);
  return (
    <ToastContainer className="form-messages">
      {props.stateStuff.messages.map((message, i) => (
        <FormMessage key={i} message={message} {...props} />
      ))}
    </ToastContainer>
  );
};

const FormMessage = ({ message }: { message: Message }) => {
  const {
    body,
    bodyId,
    bodyValues,
    header,
    headerId,
    headerValues,
    extraInfo,
    type,
  } = message;

  const [showToast, setShowToast] = useState(true);

  return (
    <Toast
      show={showToast}
      onClose={() => setShowToast(false)}
      delay={5000}
      autohide={type !== "error"}
      className={`form-message form-message-${type}`}
    >
      {(headerId || header) && (
        <Toast.Header>
          <strong className="me-auto">
            <FormattedMessage
              id={headerId || ""}
              defaultMessage={header}
              values={headerValues}
            />
          </strong>
          {extraInfo && <small>{extraInfo}</small>}
        </Toast.Header>
      )}
      <Toast.Body>
        <FormattedMessage
          id={bodyId || ""}
          defaultMessage={body}
          values={bodyValues}
        />
      </Toast.Body>
    </Toast>
  );
};

export default FormMessages;
