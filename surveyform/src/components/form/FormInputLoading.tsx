import React from "react";
import { Loading } from "~/components/ui/Loading";

export const FormInputLoading = ({ loading, children }) => {
  return (
    <div
      className={`form-input-loading form-input-loading-${
        loading ? "isLoading" : "notLoading"
      }`}
    >
      <div className="form-input-loading-inner">{children}</div>
      {loading && (
        <div className="form-input-loading-loader">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default FormInputLoading;
