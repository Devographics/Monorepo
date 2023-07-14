import { rscAllLocalesMetadata } from "~/lib/api/rsc-fetchers";

export default async function Page() {
  const result = await rscAllLocalesMetadata({ shouldThrow: false });
  return (
    <div>
      <h2>Locales Metadata</h2>
      <pre>
        <code>{JSON.stringify(result, null, 2)}</code>
      </pre>
    </div>
  );
}
