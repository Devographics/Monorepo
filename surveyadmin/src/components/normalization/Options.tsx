import React from "react";

const Options = ({
  onlyUnnormalized,
  setNormalizationMode,
  segmentSize,
  setSegmentSize,
}) => {
  return (
    <div className="normalization-options">
      {/* 
      note: the following feature does not currently work in conjunction with segmenting
      normalizations in batches, because after a while it always reruns on the same initial segment
      of unnormalized responses. 
      */}
      {/* <label>
        <input
          type="checkbox"
          checked={onlyUnnormalized}
          onClick={() => {
            setNormalizationMode(onlyUnnormalized ? "all" : "only_normalized");
          }}
        />{" "}
        Only normalize unnormalized values
      </label> */}
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
