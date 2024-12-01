import { fetchEditionMetadata } from "@devographics/fetch";
import { AppName } from "@devographics/types";

interface Params {
  surveyId: string;
  editionId: string;
}
export default async function Page(props: { params: Promise<Params> }) {
  const params = await props.params;
  const { surveyId, editionId } = params;
  const result = await fetchEditionMetadata({
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
