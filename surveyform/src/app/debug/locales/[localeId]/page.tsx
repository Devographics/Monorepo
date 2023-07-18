import { getCommonContexts } from "~/i18n/config";
import { fetchLocale } from "@devographics/fetch";
import { AppName } from "@devographics/types";

interface Params {
  localeId: string;
}

export default async function Page({ params }: { params: Params }) {
  const { localeId } = params;
  const result = await fetchLocale({
    appName: AppName.SURVEYFORM,
    localeId,
    contexts: getCommonContexts(),
    shouldThrow: false,
  });
  return (
    <div>
      <h2>
        {localeId} Metadata (contexts: {getCommonContexts().join(", ")})
      </h2>
      <pre>
        <code>{JSON.stringify(result, null, 2)}</code>
      </pre>
    </div>
  );
}
