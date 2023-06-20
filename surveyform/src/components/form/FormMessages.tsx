// Note: these messages are now displayed from the AppLayout level

"use client";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { FormInputProps } from "./typings";
import Toast from "react-bootstrap/Toast";
import { FormattedMessage } from "../common/FormattedMessage";
import ToastContainer from "react-bootstrap/ToastContainer";
import newGithubIssueUrl from "new-github-issue-url";
import { Share } from "../icons";

export interface Message {
  type: "error" | "success" | "info";
  header?: string;
  headerId?: string;
  headerValues?: any;
  extraInfo?: string;
  body?: string;
  bodyId?: string;
  bodyValues?: any;
  debugInfo?: any;
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
    debugInfo,
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
        {debugInfo && <DebugLink debugInfo={debugInfo} />}
      </Toast.Body>
    </Toast>
  );
};

const getIssueReportUrl = ({ location, timestamp, data, error }) => {
  return newGithubIssueUrl({
    user: "devographics",
    repo: "monorepo",
    title: `[surveyform] saveResponse Issue: ${error.message}`,
    labels: ["saveResponse issue"],
    body: `
⚠️IMPORTANT: please make sure to remove any private data from the “Submitted Data” log⚠️

### Submitted Data:

\`\`\`
${JSON.stringify(data, null, 2)}
\`\`\`

### Location

${location}

### Timestamp

${timestamp.toString()}

### Error:

\`\`\`
${JSON.stringify(error, null, 2)}
\`\`\`

`,
  });
};

const DebugLink = ({ debugInfo }) => {
  return (
    <a
      className="form-message-debug-link"
      target="_blank"
      rel="nofollow"
      href={getIssueReportUrl(debugInfo)}
    >
      <FormattedMessage id="error.report_issue" />
      <Share />
    </a>
  );
};
export default FormMessages;
