import { getConfig, getVariables } from "@devographics/helpers";
import { AppName } from "@devographics/types";

const limit = 10;
const format = (s) => {
  const clean = s.replace("http://", "").replace("https://", "");
  return clean.length > limit ? clean.slice(0, limit) + "…" : clean;
};

export default async function Page() {
  const variables = getVariables();
  const config = getConfig({ appName: AppName.SURVEYFORM });
  return (
    <div>
      <h2>Env Vars</h2>
      <table className="table info-table">
        <thead>
          <tr>
            <th>Variable</th>
            <th>Value</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(config).map((envVar) => {
            const varDef = variables.find((v) => v.id === envVar);
            return (
              <tr key={envVar}>
                <td>
                  <code>{envVar}</code>
                </td>
                <td>
                  <code>{format(config[envVar])}</code>
                </td>
                <td>{varDef?.description}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
