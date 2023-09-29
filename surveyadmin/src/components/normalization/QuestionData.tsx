const QuestionData = ({ questionData }) => {
  return (
    <pre>
      <code>{JSON.stringify(questionData, null, 2)}</code>
    </pre>
  );
};

export default QuestionData;
