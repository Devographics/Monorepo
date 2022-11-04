import React, { useState } from "react";
import get from "lodash/get.js";
import { useVulcanComponents } from "@vulcanjs/react-ui";

const Fields = ({
  survey,
  field,
  unnormalizedFieldsLoading,
  unnormalizedFieldsData,
}) => {
  const Components = useVulcanComponents();

  const [showIds, setShowIds] = useState(true);

  // useEffect(()=> {
  // run GraphQL query

  // }, [survey, field])

  if (unnormalizedFieldsLoading) {
    return (
      <div>
        Loading… <Components.Loading />
      </div>
    );
  }

  const results = get(unnormalizedFieldsData, "unnormalizedFields");

  if (!results) return <p>Nothing to normalize</p>;

  return (
    <div>
      <h5>
        {results.length} Missing Normalizations for {survey.slug}/{field.id}
      </h5>
      <p>
        <input
          type="checkbox"
          checked={showIds}
          onClick={() => {
            setShowIds(!showIds);
          }}
        />{" "}
        Show IDs
      </p>
      <ol>
        {results.map(({ _id, responseId, value }) => (
          <li key={_id}>
            {value}{" "}
            {showIds && (
              <span>
                (<code>{responseId}</code>→<code>{_id}</code>)
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Fields;
