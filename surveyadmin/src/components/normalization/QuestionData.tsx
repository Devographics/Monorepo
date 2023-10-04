import { ResponseData } from "@devographics/types";

const QuestionData = ({ questionData }: { questionData: ResponseData }) => {
  return (
    <div>
      <h5>Current Normalized Results</h5>
      {questionData ? (
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
      ) : (
        <div>No question data found.</div>
      )}
    </div>
  );
};

export default QuestionData;
