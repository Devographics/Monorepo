export const ImportData = ({
  surveyId,
  editionId,
}: {
  surveyId: string;
  editionId: string;
}) => {
  return (
    <div>
      <h1>Import data from an external source</h1>
      <p>
        Advanced data analysis algorithm can be run on the exported/flattened
        CSV data.{" "}
      </p>
      <p>This interface allows importing the result of this analysis.</p>
      <ul>
        <li>
          The CSV file must have a `responseId` header, which will be used to
          reconcile data. It corresponds to the _id of the original response
          (NOT the _id of the exported normalized response)
        </li>
        <li>
          Fields that already exist in the "normalized response" collection will
          be ignored. We can only add fields, not update existing ones.
        </li>
      </ul>
      <p>WORK IN PROGRESS</p>
      {/**
       *
       * TODO:
       * - allow to upload a CSV file
       * - fill a new collection
       * - make sure we use the right editionId/surveyId?
       * they might not be in the normalizedResponse collection
       * thus not in the exported data => we must be careful
       * to select the right ids in this import interface
       * - optionnaly add a button to allow merging those data
       * in the normalizedResponse collection?
       */}
    </div>
  );
};
