import { DebugRSC } from "../debug/DebugRSC";

export const RSCFetch = async ({ fetch, render }) => {
  const result = await fetch();
  return (
    <>
      <DebugRSC ___metadata={result.___metadata} />
      {result.error ? (
        <div>
          <h3>RSC Error!</h3>
          <pre>
            <code>{JSON.stringify(result.error, null, 2)}</code>
          </pre>
        </div>
      ) : (
        render(result)
      )}
    </>
  );
};
