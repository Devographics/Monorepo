import React, { useRef } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useVulcanComponents } from "@vulcanjs/react-ui";

const statsQuery = `query StatsQuery {
  stats {
    contents
  }
  cacheStats
}
`;

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj, undefined, 2));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

const AdminStats = () => {
  const Components = useVulcanComponents();
  const { loading, data = {} } = useQuery(gql(statsQuery));
  if (loading) {
    return <Components.Loading />;
  }
  console.log("data", data);
  return (
    <div className="admin-stats admin-content">
      <div className="actions">
        {/** TODO need migration
         * 
         * 
         * 
        <Components.MutationButton
          label="Get User Data"
          mutationOptions={{
            name: "getUserData",
            args: { email: "String!" },
          }}
          submitCallback={() => {
            const email = prompt("Email:");
            if (email) {
              return { mutationArguments: { email } };
            }
          }}
          successCallback={(result) => {
            const data = result.data.getUserData;
            downloadObjectAsJson(data, `${data.email}_data`);
          }}
        />
        <Components.MutationButton
          label="Purge User Data"
          mutationOptions={{
            name: "purgeUserData",
            args: { email: "String!" },
          }}
          submitCallback={() => {
            const email = prompt("Email:");
            if (email) {
              return { mutationArguments: { email } };
            }
          }}
          successCallback={(result) => {
            const data = result.data.getUserData;
            downloadObjectAsJson(data, `${data.email}_data`);
            alert(`Data for email ${data.email} purged!`);
          }}
        />
         */}
      </div>
      <h3>Responses Stats</h3>
      {/*
      TODO: Card component not yet reenabled
      <Components.Card document={get(data, "stats.contents")} />
      */}
      <h1>TODO: CARD COMPONENT NOT YET REENABLED</h1>
      <h3>
        <span>Cache Stats</span>
        <Components.MutationButton
          label="Clear Cache"
          //mutationOptions={{
          //  name: "clearCache",
          //}}
          mutation={gql`
            mutation clearCache {
              clearCache
            }
          `}
          successCallback={() => {
            alert("Cache flushed");
          }}
        />
      </h3>
      {/*
      TODO: Card component not yet reenabled
      <Components.Card document={get(data, "cacheStats")} />
      */}
      <h1>TODO: CARD COMPONENT NOT YET REENABLED</h1>
    </div>
  );
};

export default AdminStats;
