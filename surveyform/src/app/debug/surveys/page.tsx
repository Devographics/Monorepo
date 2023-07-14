import { rscFetchSurveysMetadata } from "~/lib/surveys/rsc-fetchers";

export default async function Page() {
  const result = await rscFetchSurveysMetadata();
  return (
    <div>
      <h2>Surveys Metadata</h2>
      <pre>
        <code>{JSON.stringify(result, null, 2)}</code>
      </pre>
    </div>
  );
}
