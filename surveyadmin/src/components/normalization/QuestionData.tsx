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
  return (
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
      {questionData ? (
        showData && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {questionData.currentEdition.buckets.map(({ id, count }) => (
                <tr key={id}>
                  <td>
                    <NormToken id={id} responses={responses} />
                  </td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : (
        <div>No question data found.</div>
      )}
    </div>
  );
};

export default QuestionData;
