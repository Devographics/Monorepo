"use client";
import { useState } from "react";
import { runScript } from "~/lib/scripts/services";
// import { MutationButton } from "~/core/components/ui/MutationButton";

const AdminScripts = ({ scripts, surveys }) => {
  return (
    <div className="admin-scripts admin-content">
      <h2>Scripts</h2>
      <table className="admin-scripts-table">
        <thead>
          <tr>
            <th>Script</th>
            <th>Description</th>
            <th>Arguments</th>
            <th>Actions</th>
            <th>Done</th>
          </tr>
        </thead>
        <tbody>
          {scripts.map((script) => (
            <Script key={script.id} {...script} surveys={surveys} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Script = ({ id, description, args, done, surveys }) => {
  const [result, setResult] = useState<any | undefined>();
  const [scriptArgs, setScriptArgs] = useState({});
  const [loading, setLoading] = useState(false);
  const [editionIds, setEditionIds] = useState([]);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await runScript({ id, scriptArgs });
    setResult(result);
    setLoading(false);
  };
  return (
    <>
      <tr className="admin-script-actions">
        <td className="admin-script-name">{id}</td>
        <td>
          <span>{description}</span>
        </td>
        <td>
          {args && (
            <form className="admin-args">
              {args.map((argName) => (
                <ArgumentField
                  key={argName}
                  argName={argName}
                  scriptArgs={scriptArgs}
                  setScriptArgs={setScriptArgs}
                  surveys={surveys}
                  editionIds={editionIds}
                  setEditionIds={setEditionIds}
                />
              ))}
            </form>
          )}
        </td>
        <td>
          <button onClick={handleSubmit}>
            Run {loading ? <span aria-busy={true} /> : ""}
          </button>
        </td>
        <td>{done && "✅"}</td>
      </tr>
      {result && (
        <tr>
          <td colSpan={5}>
            <div className="admin-script-result">
              <button
                onClick={() => {
                  setResult(undefined);
                }}
              >
                X
              </button>
              <pre>
                <textarea>{JSON.stringify(result, null, 2)}</textarea>
              </pre>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const ArgumentField = ({
  argName,
  scriptArgs,
  setScriptArgs,
  surveys,
  editionIds,
  setEditionIds,
}) => {
  const selectProps = {
    argName,
    scriptArgs,
    setScriptArgs,
    surveys,
    editionIds,
    setEditionIds,
  };
  return (
    <label>
      <span>{argName}</span>
      {argName === "surveyId" ? (
        <SurveySelect {...selectProps} />
      ) : argName === "editionId" ? (
        <EditionSelect {...selectProps} />
      ) : (
        <input
          type="text"
          value={scriptArgs[argName]}
          onChange={(e) => {
            const newValue = e.target.value;
            setScriptArgs((scriptArgs) => ({
              ...scriptArgs,
              [argName]: newValue,
            }));
          }}
        />
      )}
    </label>
  );
};

const SurveySelect = ({
  scriptArgs,
  argName,
  setEditionIds,
  setScriptArgs,
  surveys,
}) => (
  <select
    value={scriptArgs[argName]}
    onChange={(e) => {
      const newValue = e.target.value;
      const survey = surveys.find((s) => s.id === newValue);
      const editionIds = survey.editions.map((e) => e.id);
      setEditionIds(editionIds);
      setScriptArgs((scriptArgs) => ({
        ...scriptArgs,
        surveyId: newValue,
        editionId: editionIds[0],
      }));
    }}
  >
    {surveys.map((survey) => (
      <option key={survey.id} value={survey.id}>
        {survey.id}
      </option>
    ))}
  </select>
);

const EditionSelect = ({ scriptArgs, argName, setScriptArgs, editionIds }) => (
  <select
    value={scriptArgs[argName]}
    onChange={(e) => {
      const newValue = e.target.value;
      setScriptArgs((scriptArgs) => ({
        ...scriptArgs,
        [argName]: newValue,
      }));
    }}
  >
    {editionIds.map((editionId) => (
      <option key={editionId} value={editionId}>
        {editionId}
      </option>
    ))}
  </select>
);

export default AdminScripts;
