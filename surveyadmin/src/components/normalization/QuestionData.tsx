import { ResponseData } from "@devographics/types";
import { useState } from "react";
import NormToken from "./NormToken";
import { NormalizationResponse } from "~/lib/normalization/hooks";

const QuestionData = ({
  questionData,
  responses,
}: {
  questionData: ResponseData;
  responses: NormalizationResponse[];
}) => {
  const [showData, setShowData] = useState(false);
  return questionData ? (
    <div>
      <h3>
        Current Normalized Results{" "}
        <a
          role="button"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowData(!showData);
          }}
        >
          {showData ? "Hide" : "Show"}
        </a>
      </h3>
      {showData && (
        <div>
          <div>
            <p>
              This table shows aggregated counts for the subset of the data that
              has already been processed.
            </p>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>ID</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {questionData.currentEdition.buckets.map(
                  ({ id, count }, index) => (
                    <tr key={id}>
                      <td>{index + 1}.</td>
                      <td>
                        <NormToken id={id} responses={responses} />
                      </td>
                      <td>{count}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  ) : (
    <p>No question data found.</p>
  );
};

export default QuestionData;
