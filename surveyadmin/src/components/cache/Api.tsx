"use client";

import { useReducer, useState } from "react";
import { runScript } from "~/lib/scripts/services";

export const actions = [
  {
    label: "Reload Surveys",
    script: "reloadAPISurveys",
  },
  {
    label: "Reload Locales",
    script: "reloadAPILocales",
  },
  {
    label: "Reload Entities",
    script: "reloadAPIEntities",
  },
];

export const APIDashboard = () => (
  <div>
    <h3>API</h3>
    <p>Each button tell the API to reload relevant data.</p>
    <p>
      The API will in turn send a request to the Surveyform to refresh static
      pages and its own caches.
    </p>
    <div className="api-dashboard">
      <section>
        <h4>Development</h4>
        <ul>
          {actions.map((action) => (
            <li key={action.label}>
              <Action {...action} target="development" />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Staging</h4>
        <ul>
          {actions.map((action) => (
            <li key={action.label}>
              <Action {...action} target="staging" />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Production</h4>
        <ul>
          {actions.map((action) => (
            <li key={action.label}>
              <Action {...action} target="production" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  </div>
);

const actionReducer = (state, action) => {
  switch (action.type) {
    case "init": {
      return { loading: true, result: null, error: null };
    }
    case "error": {
      return { loading: false, result: null, error: action.payload };
    }
    case "done": {
      return { loading: false, result: action.payload, error: null };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
};

const MaybeJson = ({ data }: { data: any }) => {
  if (!data) return <p>No data</p>;
  try {
    const res = JSON.stringify(data, null, 2);
    return (
      <p>
        <code>
          <pre>{res}</pre>
        </code>
      </p>
    );
  } catch (err) {
    return <p>{data.toString()}</p>;
  }
};
const Action = ({ label, script, target }) => {
  const [{ loading, result, error }, dispatch] = useReducer(actionReducer, {
    loading: false,
    result: null,
    error: null,
  });
  const handleClick = async (e) => {
    try {
      e.preventDefault();
      dispatch({ type: "init" });
      const result = await runScript({ id: script, scriptArgs: { target } });
      dispatch({ type: "done", payload: result });
      console.log(result);
    } catch (err) {
      dispatch({ type: "error", payload: error });
    }
  };
  return (
    <>
      <a role="button" href="#" aria-busy={loading} onClick={handleClick}>
        {label}
      </a>
      {result && <MaybeJson data={result} />}
      {error && <p>{error}</p>}
    </>
  );
};
export default APIDashboard;
