export const DebugRSC = (dataObjects) => {
  return (
    <>
      {Object.keys(dataObjects).map((key, i) => {
        const data = { functionKey: key, ...dataObjects[key] };
        return (
          <div key={i} className="debug-rsc" style={{ display: "none" }}>
            {JSON.stringify(data, null, 2)}
          </div>
        );
      })}
    </>
  );
};
