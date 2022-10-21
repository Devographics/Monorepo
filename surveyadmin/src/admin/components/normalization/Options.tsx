import React from "react";

const Options = ({
  onlyUnnormalized,
  setNormalizationMode,
  segmentSize,
  setSegmentSize,
}) => {
  return (
    <div className="normalization-options">
      <label>
        <input
          type="checkbox"
          checked={onlyUnnormalized}
          onClick={() => {
            setNormalizationMode(onlyUnnormalized ? "all" : "only_normalized");
          }}
        />{" "}
        Only normalize unnormalized values
      </label>
      <label>
        <input
          type="text"
          value={segmentSize}
          onChange={(e) => {
            setSegmentSize(Number(e.target.value));
          }}
        />{" "}
        Segment size
      </label>
    </div>
  );
};

export default Options;
