"use client";
import Link from "next/link";
import { useState } from "react";
import { routes } from "~/lib/routes";
import { runScript } from "~/lib/scripts/services";
// import { MutationButton } from "~/core/components/ui/MutationButton";

const AdminScripts = ({ scripts }) => {
  return (
    <div className="admin-scripts admin-content">
      <Link href={routes.home.href()}>Home</Link>
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
          {scripts.map((script) => (
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
  const [loading, setLoading] = useState(false);
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
