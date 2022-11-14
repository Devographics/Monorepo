import { useVulcanComponents } from "@vulcanjs/react-ui";
import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import trim from "lodash/trim.js";

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
  const Components = useVulcanComponents();
  const { loading, data = {} } = useQuery(scriptsQuery);
  if (loading) {
    return <Components.Loading />;
  }
  return (
    <div className="admin-scripts admin-content">
      <h3>Scripts</h3>
      {data.scripts.map(({ id }) => (
        <Script key={id} id={id} />
      ))}
    </div>
  );
};

const Script = ({ id }) => {
  const Components = useVulcanComponents();
  const [result, setResult] = useState();
  const [scriptArgs, setScriptArgs] = useState({});
  const [scriptName, ...argNames] = id.split("__");

  return (
    <div>
      <h5 className="admin-script">
        <span>{scriptName}</span>{" "}
        {argNames && (
          <form className="admin-args">
            {argNames.map((argName) => (
              <ArgumentField
                key={argName}
                argName={argName}
                scriptArgs={scriptArgs}
                setScriptArgs={setScriptArgs}
              />
            ))}
          </form>
        )}
        <Components.MutationButton
          label="Run"
          mutation={runScriptMutation}
          mutationArguments={{ id, scriptArgs }}
          successCallback={(result) => {
            console.log(result);
            setResult(result.data.runScript);
          }}
        />
        {result && (
          <button
            onClick={() => {
              setResult(null);
            }}
          >
            X
          </button>
        )}
      </h5>
      {result && (
        <pre>
          <code>{JSON.stringify(result, null, 2)}</code>
        </pre>
      )}
    </div>
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
        setScriptArgs(scriptArgs => ({ ...scriptArgs, [argName]: newValue }));
      }}
    />
  </label>
);

export default AdminScripts;
