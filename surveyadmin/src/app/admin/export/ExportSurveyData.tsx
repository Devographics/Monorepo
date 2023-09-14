"use client";
import React, { useReducer, useState } from "react";
import { apiRoutes } from "~/lib/apiRoutes";

/**
 * Trigger a file download for any URL
 *
 * NOTE: if the download fails and the server returns a JSON,
 * this will show the download file as a .json because of the response application type
 * @param url
 */
const triggerDownload = (url: string, filename?: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "";
  document.body.appendChild(a);
  a.click();
  a.remove();
  /*
         Alternative code with fetch
         This is better to handle error messages, however it rely on
         loading the file client-side as a BLOB, which can cost a lot of RAM

         const response = await fetch(apiRoutes.admin.dataExport.href, {
           method: "GET",
           body: JSON.stringify(body),
           headers: {
             "Content-type": "application/json",
           },
         });

         if (!response.ok) {
           const body = await response.text();
           console.error(body);
           dispatch({
             type: "error",
             payload: new Error(body.slice(0, 500)),
           });
         } else {
           dispatch({ type: "done" });
           try {
             await downloadFromResponse(response, "export.json");
             dispatch({ type: "downloadStarted" });
           } catch (error) {
             dispatch({ type: "error", payload: error });
           }
         }*/
};

/**
 * Useful when getting the file from a POST request or a fetch response
 *
 * However it's easier to generate a <a> tag and let it trigger the relevant GET request automatically,
 * instead of using fetch
 */
const downloadFromResponse = async (response: Response, filename: string) => {
  const blob = await response.blob();
  var url = window.URL.createObjectURL(blob);
  triggerDownload(url, filename);
};

const initialState = { loading: false, error: null, res: null, done: false };
const exportReducer = (state, action) => {
  switch (action.type) {
    case "start": {
      return { loading: true, error: null, done: false };
    }
    case "done": {
      return { loading: false, error: null, done: true };
    }
    case "downloadStarted": {
      return initialState;
    }
    case "error": {
      const error = action.payload;
      return { loading: false, error, res: null, done: false };
    }
    default: {
      return { loading: false, res: null, error: null, done: false };
    }
  }
};

export const ExportSurveyData = ({
  surveyId,
  editionId,
}: {
  surveyId: string;
  editionId: string;
}) => {
  const [state, dispatch] = useReducer(exportReducer, initialState);

  // timestamp = the unique id for the latest export
  // we can pass it back to the server to download or further process the generated file
  const [timestamp, setTimestamp] = useState<null | string>(null);

  /**
   * Trigger the generation of an export server-side,
   * that will be stored in a tmp folder
   */
  async function generateExport({
    surveyId,
    editionId,
  }: {
    surveyId: string;
    editionId: string;
  }) {
    try {
      dispatch({ type: "start" });
      const url = apiRoutes.export.generate.href({ surveyId, editionId });
      // TODO: error handling
      const { timestamp } = await (await fetch(url)).json();
      setTimestamp(timestamp as string);
      dispatch("downloadStarted");
    } catch (error) {
      console.error(error);
      dispatch({ type: "error", payload: error });
    }
  }
  /**
   * Download previously gnerated export
   * @param param0
   * @returns
   */
  async function downloadExport({
    surveyId,
    editionId,
    timestamp,
  }: {
    surveyId: string;
    editionId: string;
    timestamp: string;
  }) {
    try {
      if (!timestamp) {
        return dispatch({
          type: "error",
          payload:
            "No timestamp provided, please first generate an export for this survey",
        });
      }
      dispatch({ type: "start" });
      const url = apiRoutes.export.download.href({
        surveyId,
        editionId,
        timestamp,
      });

      triggerDownload(url);
      dispatch("downloadStarted");
    } catch (error) {
      console.error(error);
      dispatch({ type: "error", payload: error });
    }
  }
  return (
    <div>
      <h1>Export</h1>
      <h2>Step 1: generate a CSV export for the survey</h2>
      <p>This will create a file in your tmp folder</p>
      <button
        aria-busy={state.loading}
        disabled={state.loading}
        onClick={() => {
          if (!(surveyId && editionId)) {
            dispatch({
              type: "error",
              payload: new Error(
                "Can't trigger download without selecting surveyId && editionId"
              ),
            });
          }
          generateExport({ surveyId, editionId });
        }}
      >
        {!state.loading
          ? timestamp
            ? "Generate exports"
            : "Regenerate exports"
          : "Busy..."}
        {state.error && <p>Error: {state.error.message}</p>}
        {state.done && <p>Export done</p>}
      </button>
      <div>
        <p>
          Manually input a timestamp if you have already generated some exports,
          or copy this value to later retrieve your export:
        </p>
        <input
          type="text"
          value={timestamp || ""}
          onChange={(e) => {
            setTimestamp(e.target.value);
          }}
        />
      </div>
      {timestamp && (
        <>
          <h2>Step 3: download the CSV if you need too</h2>
          <button
            aria-busy={state.loading}
            disabled={state.loading}
            onClick={() => {
              if (!(surveyId && editionId)) {
                return dispatch({
                  type: "error",
                  payload: new Error(
                    "Can't trigger download without selecting surveyId && editionId"
                  ),
                });
              }
              if (!timestamp) {
                return dispatch({
                  type: "error",
                  payload: new Error(
                    "First generate an export before downloading it"
                  ),
                });
              }
              downloadExport({ surveyId, editionId, timestamp });
            }}
          >
            {!state.loading ? "Download exports zip" : "Busy..."}
            {state.error && <p>Error: {state.error.message}</p>}
            {state.done && <p>Download will start shortly...</p>}
          </button>
          <p>
            NOTE: if the downloaded file is a ".json" instead of ".zip" there
            has been an error server-side.
          </p>
        </>
      )}
    </div>
  );
};
