import { useVulcanComponents } from "@vulcanjs/react-ui";
import React from "react";

export const FormInputLoading = ({ loading, children }) => {
  const Components = useVulcanComponents();

  return (
    <div
      className={`form-input-loading form-input-loading-${
        loading ? "isLoading" : "notLoading"
      }`}
    >
      <div className="form-input-loading-inner">{children}</div>
      {loading && (
        <div className="form-input-loading-loader">
          <Components.Loading />
        </div>
      )}
    </div>
  );
};
