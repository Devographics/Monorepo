"use client";
import React, { useReducer, useState } from "react";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { apiRoutes } from "~/lib/apiRoutes";
import { convertSurveyToMarkdown } from "~/lib/export/outlineExport";
import { Loading } from "~/components/ui/Loading";

// import { ExportOptions, ExportOptionsStr } from "~/admin/models/export";
//  import { SurveyMarkdownOutline } from "~/core/components/survey/SurveyExport";
//  import { getEditionById } from "~/modules/surveys/helpers";
// // TODO: get from top-level context as in surveyform
// import { surveys } from "~/surveys";
// import { surveysQuery } from "~/components/normalization/Normalization";
// import { useQuery } from "~/lib/graphql";
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
const reducer = (state, action) => {
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

/**
 * Store survey and editionId into search params
 */
const useMutateSurveyId = ({ surveyId, editionId }) => {
  function setSurveyId(surveyId: string) {
    const params: any = { surveyId };
    if (editionId) params.editionId = editionId;
    window.location.search = new URLSearchParams(params).toString();
  }
  function setEditionId(editionId: string) {
    const params: any = { editionId };
    if (surveyId) params.surveyId = surveyId;
    window.location.search = new URLSearchParams(params).toString();
  }
  return { setSurveyId, setEditionId };
};

/**
 * Select edition, using the searchParams as state
 */
const EditionSelector = ({
  surveyIds,
  editionIds = [],
  surveyId,
  editionId,
}: {
  editionIds?: Array<string>;
  surveyIds: Array<string>;
  surveyId?: string | null;
  editionId?: string | null;
}) => {
  const { setSurveyId, setEditionId } = useMutateSurveyId({
    surveyId,
    editionId,
  });
  return (
    <form>
      <label htmlFor="surveyId">Survey ID</label>
      <select
        id="surveyId"
        required
        // not needed for the form, but allow to display the markdown outline
        onChange={(evt) => {
          setSurveyId(evt.target.value);
        }}
        value={surveyId || ""}
      >
        <option disabled value="">
          {" "}
          -- select an option --{" "}
        </option>
        {surveyIds.map((id) => {
          return (
            <option key={id} value={id}>
              {id}
            </option>
          );
        })}
      </select>
      {surveyId && (
        <>
          <label htmlFor="editionId">Edition ID</label>
          <select
            id="editionId"
            required
            // not needed for the form, but allow to display the markdown outline
            onChange={(evt) => {
              setEditionId(evt.target.value);
            }}
            value={editionId || ""}
          >
            <option disabled value="">
              {" "}
              -- select an option --{" "}
            </option>
            {editionIds.map((id) => {
              return (
                <option key={id} value={id}>
                  {id}
                </option>
              );
            })}
          </select>
        </>
      )}
    </form>
  );
};

/**
 * Let the user generate a CSV dump of the database
 * and do whatever further processing they need
 * @returns
 */
export const AdminExportPage = ({
  surveys,
  edition,
  surveyId,
  editionId,
}: {
  surveys: Array<SurveyMetadata>;
  edition?: EditionMetadata;
  surveyId?: string | null;
  editionId?: string | null;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const survey = surveyId ? surveys.find((s) => s.id === surveyId) : null;
  const surveyIds = surveys.map((s) => s.id);
  const editionIds = survey ? survey.editions.map((e) => e.id) : [];

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
      <h2>Step 1: select an edition</h2>
      <EditionSelector
        editionId={editionId}
        surveyId={surveyId}
        surveyIds={surveyIds}
        editionIds={editionIds}
      />
      {!!(surveyId && editionId) && (
        <>
          <h2>Step 2: generate a CSV export for the survey</h2>
          <p>This will create a file in your tmp folder</p>
          <button
            aria-busy={state.loading}
            disabled={state.loading}
            onClick={() => {
              if (!(surveyId && editionId)) {
                dispatch({
                  type: "error",
                  payload:
                    "Can't trigger download without selecting surveyId && editionId",
                });
              }
              generateExport({ surveyId, editionId });
            }}
          >
            {!state.loading ? "Generate exports" : "Loading..."}
            {state.error && <p>Error: {state.error.message}</p>}
            {state.done && <p>Export done</p>}
          </button>
          <h2>Step 3: download the CSV if you need too</h2>
          <button
            aria-busy={state.loading}
            disabled={state.loading}
            onClick={() => {
              if (!(surveyId && editionId)) {
                return dispatch({
                  type: "error",
                  payload:
                    "Can't trigger download without selecting surveyId && editionId",
                });
              }
              if (!timestamp) {
                return dispatch({
                  type: "error",
                  payload: "First generate an export before downloading it",
                });
              }
              downloadExport({ surveyId, editionId, timestamp });
            }}
          >
            {!state.loading ? "Download exports zip" : "Loading..."}
            {state.error && <p>Error: {state.error.message}</p>}
            {state.done && <p>Download will start shortly...</p>}
          </button>
          <p>
            NOTE: if the downloaded file is a ".json" instead of ".zip" there
            has been an error server-side.
          </p>
        </>
      )}
      <h2>Step 2.2: automatically flatten the CSV file</h2>
      <p>
        Note: another possible implementation would be to use a Mongo useQuery
        instead of the CSV generated by <code>mongoexport</code>.
      </p>
      <p>
        However working on the raw CSV data is easier than writing a complex
        Mongo query that would have to rely on the survey outline structure
      </p>
      <h2></h2>
      <h2>Outline</h2>
      <p>You can share this markdown content to better describe the survey</p>
      {edition ? (
        <SurveyMarkdownOutline edition={edition} />
      ) : (
        <p>Pick a valid editionId above...</p>
      )}
    </div>
  );
};

export const SurveyMarkdownOutline = ({
  edition,
}: {
  edition: EditionMetadata;
}) => {
  const [showFieldName, setShowFieldName] = useState<boolean>(false);
  // const intl = useIntlContext();
  // TODO: filter for the current survey only, but we need a tag to do so
  //const { data, loading, error } = useEntitiesQuery();

  //if (loading) return <Loading />;
  //if (error) return <span>Could not load entities</span>;
  //if (!data) return <span>No entities found</span>;
  //const { entities } = data;

  return (
    <div className="survey-section-wrapper">
      <div>
        <label htmlFor="fieldname">Show fieldName? (for CSV/JSON export)</label>
        <input
          type="checkbox"
          id="fieldname"
          name="fieldname"
          onChange={(evt) => {
            setShowFieldName(evt.target.checked);
          }}
        />
      </div>
      <textarea
        style={{ width: 800, height: 600 }}
        readOnly={true}
        value={convertSurveyToMarkdown({
          formatMessage: (key) => key, // intl.formatMessage,
          edition,
          entities: [],
          options: {
            showFieldName,
          },
        })}
      />
    </div>
  );
};
