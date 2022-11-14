import { useVulcanComponents } from "@vulcanjs/react-ui";
import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

const envQuery = gql`
  query EnvQuery {
    logOutEnv
  }
`;

export const EnvDebugPage = () => {
  const Components = useVulcanComponents();
  const { loading, data = {} } = useQuery(envQuery);
  if (loading) {
    return <Components.Loading />;
  }
  return (
    <div>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
};

export default EnvDebugPage;
