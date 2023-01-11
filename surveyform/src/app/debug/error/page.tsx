"use client";
import React, { useState, useEffect } from "react";

//import { ErrorBoundary } from "@sentry/nextjs";

const ErrorPage = () => {
  const [raiseErrorInRender, setRaiseErrorInRender] = useState(false);
  const [raiseErrorInUpdate, setRaiseErrorInUpdate] = useState(false);

  useEffect(() => {
    if (raiseErrorInUpdate) {
      throw new Error("Error in componentDidUpdate");
    }
  }, [raiseErrorInUpdate]);

  if (raiseErrorInRender) {
    throw new Error("Error in render");
  }

  return (
    <div className="container" style={{ height: "100%" }}>
      <ul>
        <li>
          <a href="#" onClick={() => setRaiseErrorInRender(true)}>
            Raise the error in render
          </a>
        </li>
        <li>
          <a href="#" onClick={() => setRaiseErrorInUpdate(true)}>
            Raise the error in componentDidUpdate
          </a>
        </li>
      </ul>
    </div>
  );
};

export default ErrorPage;
