import React, { useReducer, useRef, useState } from "react";
import { ExportOptions, ExportOptionsStr } from "~/admin/models/export";
import { SurveyMarkdownOutline } from "~/core/components/survey/SurveyExport";
import { apiRoutes } from "~/lib/apiRoutes";
import { getSurveyEditionById } from "~/modules/surveys/helpers";
// TODO: get from top-level context as in surveyform
import { surveys } from "~/surveys";
import { surveysQuery } from "~/admin/components/normalization/Normalization";
import { useQuery } from "~/lib/graphql";
import { Loading } from "~/core/components/ui/Loading";

/**
 * Trigger a file download for any URL
 * @param url
 */
const triggerDownload = (url: string, filename?: string) => {
  var a = document.createElement("a");
  a.href = url;
  a.download = filename || "";
  document.body.appendChild(a);
  a.click();
  a.remove();
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

export const AdminExportPageWithSurveys = () => {
  const { loading: surveysLoading, data: surveysData } = useQuery(surveysQuery);
  if (surveysLoading) {
    return <Loading />;
  } else {
    return <AdminExportPage surveys={surveysData.surveys} />;
  }
};
export const AdminExportPage = ({ surveys }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [editionId, setEditionId] = useState<string | undefined>();
  const allEditions = surveys.map((s) => s.editions).flat();
  const edition = allEditions.find((e) => e.id === editionId);

  async function triggerExport(evt: React.FormEvent<HTMLFormElement>) {
    try {
      evt.preventDefault();
      dispatch({ type: "start" });
      const editionId = evt.target["editionId"].value;
      // @ts-ignore
      const params = new URLSearchParams({
        editionId,
      }).toString();
      console.log(params);
      const url = apiRoutes.admin.dataExport.href + "?" + params;

      triggerDownload(url);
      dispatch("downloadStarted");
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
    } catch (error) {
      console.error(error);
      dispatch({ type: "error", payload: error });
    }
  }
  const editionIds = allEditions.map((e) => e.id);
  return (
    <div>
      <h1>Export</h1>
      <form onSubmit={triggerExport}>
        <label htmlFor="editionId">Edition ID</label>
        <select
          id="editionId"
          defaultValue="js2022"
          required
          // not needed for the form, but allow to display the markdown outline
          onChange={(evt) => {
            setEditionId(evt.target.value);
          }}
        >
          {editionIds.map((id) => {
            return (
              <option key={id} value={id}>
                {id}
              </option>
            );
          })}
        </select>
        <button type="submit" disabled={state.loading}>
          {!state.loading ? "Download exports zip" : "Loading..."}
        </button>
      </form>
      {state.error && <p>Error: {state.error.message}</p>}
      {state.done && <p>Download will start shortly...</p>}
      <h2>Outline</h2>
      <p>You can share this markdown content to better describe the survey</p>
      {edition ? (
        <SurveyMarkdownOutline survey={edition} />
      ) : (
        <p>Pick a valid editionId above...</p>
      )}
    </div>
  );
};

export default AdminExportPageWithSurveys;
