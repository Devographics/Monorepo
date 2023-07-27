"use client";

import { useState } from "react";
import { runScript } from "~/lib/scripts/services";

export const actions = [
  {
    label: "Refresh Surveys Metadata Cache",
    script: "refreshSurveysCache",
  },
  {
    label: "Refresh Locales Cache",
    script: "refreshLocalesCache",
  },
];

export const AdminCache = () => (
  <div>
    <h2>Cache</h2>
    <ul>
      {actions.map((action) => (
        <li key={action.label}>
          <Action {...action} />
        </li>
      ))}
    </ul>
  </div>
);

const Action = ({ label, script }) => {
  const [loading, setLoading] = useState(false);
  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await runScript({ id: script, scriptArgs: {} });
    console.log(result);
    setLoading(false);
  };
  return (
    <a role="button" href="#" aria-busy={loading} onClick={handleClick}>
      {label}
    </a>
  );
};
export default AdminCache;
