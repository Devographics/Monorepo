"use client";

import { useState } from "react";
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
    <h2>API</h2>

    <div className="api-dashboard">
      <section>
        <h3>Development</h3>
        <ul>
          {actions.map((action) => (
            <li key={action.label}>
              <Action {...action} target="development" />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Staging</h3>
        <ul>
          {actions.map((action) => (
            <li key={action.label}>
              <Action {...action} target="staging" />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Production</h3>
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

const Action = ({ label, script, target }) => {
  const [loading, setLoading] = useState(false);
  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await runScript({ id: script, scriptArgs: { target } });
    console.log(result);
    setLoading(false);
  };
  return (
    <a role="button" href="#" aria-busy={loading} onClick={handleClick}>
      {label}
    </a>
  );
};
export default APIDashboard;
