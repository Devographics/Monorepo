import { ResponseData } from "@devographics/types";
import { useState } from "react";

const QuestionData = ({ questionData }: { questionData: ResponseData }) => {
  const [showData, setShowData] = useState(false);
  return (
    <div>
      <h5>
        Current Normalized Results (
        {questionData?.currentEdition?.completion?.count} Responses){" "}
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
      </h5>
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
                    <code>{id}</code>
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
