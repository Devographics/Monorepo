import React from "react";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { SurveyMarkdownOutline } from "./SurveyMarkdownOutline";
import { ExportSurveyData } from "./ExportSurveyData";
import { ImportData } from "./ImportData";

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
  const survey = surveyId ? surveys.find((s) => s.id === surveyId) : null;
  const surveyIds = surveys.map((s) => s.id);
  const editionIds = survey ? survey.editions.map((e) => e.id) : [];

  return (
    <div>
      <h1>Pick an edition</h1>
      <EditionSelector
        editionId={editionId}
        surveyId={surveyId}
        surveyIds={surveyIds}
        editionIds={editionIds}
      />
      {!!(surveyId && editionId) && (
        <>
          <ExportSurveyData surveyId={surveyId} editionId={editionId} />
          <div>
            <h1>Flatten the CSV JSON fields</h1>
            <p>
              The CSV file generated using Mongo export will contain stringified
              JSON.
            </p>
            <p>
              See our private "datascience" repository "csvcleaner" script to
              flatten the JSON data.
            </p>
          </div>
          <div>
            <h1>Outline</h1>
            <p>
              You can share this markdown content to better describe the survey
            </p>
            {edition ? (
              <SurveyMarkdownOutline edition={edition} />
            ) : (
              <p>Pick a valid editionId above...</p>
            )}
          </div>
          <ImportData surveyId={surveyId} editionId={editionId} />
        </>
      )}
    </div>
  );
};
