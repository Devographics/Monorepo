"use client";
import React, { useState } from "react";
import gql from "graphql-tag";
import { useQuery } from "~/lib/graphql";
import { Loading } from "~/core/components/ui/Loading";
import { MutationButton } from "~/core/components/ui/MutationButton";

const scriptsQuery = gql`
  query ScriptsQuery {
    scripts
  }
`;

const runScriptMutation = gql`
  mutation RunScript($id: String, $scriptArgs: JSON) {
    runScript(id: $id, scriptArgs: $scriptArgs)
  }
`;

const AdminScripts = () => {
  const { loading, data = {}, error } = useQuery(scriptsQuery);
  if (loading) {
    return <Loading />;
  }
  return (
    <div className="admin-scripts admin-content">
      <h3>Scripts</h3>
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
          {data.scripts.map((script) => (
            <Script key={script.id} {...script} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Script = ({ id, description, args, done }) => {
  const [result, setResult] = useState<any | undefined>();
  const [scriptArgs, setScriptArgs] = useState({});

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
                />
              ))}
            </form>
          )}
        </td>
        <td>
          <MutationButton
            label="Run"
            mutation={runScriptMutation}
            mutationArguments={{ id, scriptArgs }}
            successCallback={(result) => {
              console.log(result);
              setResult(result.data.runScript);
            }}
          />
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

const ArgumentField = ({ argName, scriptArgs, setScriptArgs }) => (
  <label>
    <span>{argName}</span>
    <input
      type="text"
      value={scriptArgs[argName]}
      onChange={(e) => {
        const newValue = e.target.value;
        setScriptArgs((scriptArgs) => ({ ...scriptArgs, [argName]: newValue }));
      }}
    />
  </label>
);

export default AdminScripts;
