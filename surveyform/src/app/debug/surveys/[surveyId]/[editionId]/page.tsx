import { fetchEditionMetadata } from "@devographics/fetch";
import { AppName } from "@devographics/types";

interface Params {
  surveyId: string;
  editionId: string;
}
export default async function Page({ params }: { params: Params }) {
  const { surveyId, editionId } = params;
  const result = await fetchEditionMetadata({
    appName: AppName.SURVEYFORM,
    surveyId,
    editionId,
    shouldThrow: false,
  });
  return (
    <div>
      <h2>{result.data.id} Metadata</h2>
      <pre>
        <code>{JSON.stringify(result, null, 2)}</code>
      </pre>
    </div>
  );
}
