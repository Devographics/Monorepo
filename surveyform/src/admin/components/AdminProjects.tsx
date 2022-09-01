import { useVulcanComponents, VulcanComponentsProvider, defaultDatatableComponents } from "@vulcanjs/react-ui";
import React from "react";
import { Project } from "~/modules/projects";

const AdminProjects = () => {
  const Components = useVulcanComponents();

  return (
    <div className="admin-projects admin-content">

      <VulcanComponentsProvider
        value={{
          ...defaultDatatableComponents,
        }}>
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
    </div>
  );
};

export default AdminProjects;
