import React from "react";
import gql from "graphql-tag";
import { serverConfig } from "~/config/server";
import { print } from "graphql";

const envQuery = gql`
  query EnvQuery {
    logOutEnv
  }
`;
/**
 * NOTE: the logOutEnv endpoint is currently disabled, this page will fail
 * @returns
 */
const getEnv = async () => {
  const headers = {
    //...req.headers,
    "content-type": "application/json",
  };
  const gqlRes = await fetch(serverConfig.appUrl + "/api/graphql", {
    method: "POST",
    // @ts-ignore
    headers,
    // TODO: this query doesn't consider the survey slug
    body: JSON.stringify({
      query: print(envQuery),
    }),
  });
  if (!gqlRes.ok) {
    console.error("EnvQuery esponse text:", await gqlRes.text());
    throw new Error("Error during fetch");
  }
  const data = await gqlRes.json();
  return data;
};

export const EnvDebugPage = async () => {
  const data = await getEnv();
  return (
    <div>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
};

export default EnvDebugPage;
