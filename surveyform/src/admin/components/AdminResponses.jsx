import { useVulcanComponents } from "@vulcanjs/react-ui";
import React from "react";
import { getResponseData } from "~/modules/responses/helpers";

const ResponseData = ({ document }) => {
  const Components = useVulcanComponents();
  return (
    <Components.ModalTrigger label="Raw Data" size="xl">
      <Components.Card document={getResponseData(document)} />
    </Components.ModalTrigger>
  );
};

const NormalizedData = ({ document }) => {
  const Components = useVulcanComponents();
  return document.normalizedResponse ? (
    <Components.ModalTrigger label="Norm. Data" size="xl">
      <Components.Card document={document.normalizedResponse} />
    </Components.ModalTrigger>
  ) : null;
};

const Completion = ({ document }) => <span>{document.completion}%</span>;

const User = ({ document }) => {
  const Components = useVulcanComponents();
  return (
    <Components.ModalTrigger label={document.user.displayName} size="xl">
      <Components.Card document={document.user} />
    </Components.ModalTrigger>
  );
};

const AdminResponses = () => {
  const Components = useVulcanComponents();
  return (
    <div className="admin-responses admin-content">
      <Components.Datatable
        collectionName="Responses"
        showDelete={true}
        options={{
          fragmentName: "ResponseAdminFragment",
          pollInterval: 0,
        }}
        initialState={{
          sort: {
            updatedAt: "desc",
          },
        }}
        // showNew={false}
        columns={[
          // '_id',
          { name: "createdAt", sortable: true },
          { name: "updatedAt", sortable: true },
          { name: "completion", sortable: true, component: Completion },
          { name: "surveySlug", label: "Survey", filterable: true },
          // 'aboutyou_youremail',
          // 'isSynced',
          { name: "user", component: User },
          { name: "data", component: ResponseData },
          {
            name: "normalizedData",
            label: "Normalized",
            component: NormalizedData,
          },
        ]}
      />
    </div>
  );
};

export default AdminResponses;
