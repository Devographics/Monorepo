import { useState, useEffect, Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Toast from "react-bootstrap/Toast";
import { FormInputProps } from "./typings";
import type { ServerErrorObject } from "~/lib/validation";
import { ResponseErrorContents } from "../error/ResponseError";

export const FormError = ({ stateStuff }: FormInputProps) => {
  const { errorResponse } = stateStuff;
  const [showToast, setShowToast] = useState(!!errorResponse);

  useEffect(() => {
    if (errorResponse) {
      setShowToast(true);
    }
  }, [errorResponse]);

  return errorResponse ? (
    <Error
      errorResponse={errorResponse}
      showToast={showToast}
      setShowToast={setShowToast}
    />
  ) : null;
};

const Error = ({
  errorResponse,
  showToast,
  setShowToast,
}: {
  errorResponse: ServerErrorObject;
  showToast: boolean;
  setShowToast: Dispatch<SetStateAction<boolean>>;
}) => {
  const { id, message, status } = errorResponse;
  const toggleShowToast = () => setShowToast(!showToast);

  return (
    <Toast show={showToast} onClose={toggleShowToast}>
      <Toast.Header>
        <strong className="me-auto">{id}</strong>
        <small>{status}</small>
      </Toast.Header>
      <Toast.Body>
        <ResponseErrorContents responseError={errorResponse} />
      </Toast.Body>
    </Toast>
  );
};
