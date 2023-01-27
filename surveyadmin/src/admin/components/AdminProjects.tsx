import React from "react";
import { Project } from "@devographics/core-models/server";

const AdminProjects = () => {
  return (
    <div className="admin-projects admin-content">
      {/**
       *  TODO: create a normal table with relevant gql query
       * 
      <VulcanComponentsProvider
        value={{
          ...defaultDatatableComponents,
        }}
      >
        <Components.Datatable
          model={Project}
          columns={[
            "_id",
            "id",
            "name",
            "description",
            "github",
            "npm",
            "homepage",
          ]}
          // TODO: need to support redirection, datatable is not yet clean
          push={console.warn}
        />
      </VulcanComponentsProvider>

       */}
    </div>
  );
};

export default AdminProjects;
