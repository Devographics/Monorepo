import { useState } from "react";

/**
 * TODO: should be props of the Forms as well for initialization
 * TODO: those callbacks aren't even called in the Form, so they do nothing yet...
 */
export interface AddSubmitCallbacks {
  /**
   * To be called in a useEffect on component mount
   * Used to clean advanced input values on submit events,
   * eg UploadInput
   */
  addToSubmitForm: (cb: any) => void;
  /**
   * To be called in a useEffect on component mount
   * Used to clean advanced input values on submit events,
   * eg UploadInput
   */
  addToSuccessForm: (cb: any) => void;
  /**
   * To be called in a useEffect on component mount
   * Used to clean advanced input values on submit events,
   * eg UploadInput
   */
  addToFailureForm: (cb: any) => void;
}
/**
 * Advanced callbacks that lets an input hook some logic on submit/success/failure
 */
export const useSubmitCallbacks = () => {
  const [callbacks, setCallbacks] = useState<{
    submitFormCallbacks: Array<any>;
    successFormCallbacks: Array<any>;
    failureFormCallbacks: Array<any>;
  }>({
    submitFormCallbacks: [],
    successFormCallbacks: [],
    failureFormCallbacks: [],
  });
  // add a callback to the form submission
  const addToSubmitForm = (callback) => {
    setCallbacks((cbs) => ({
      ...cbs,
      submitFormCallbacks: [...cbs.submitFormCallbacks, callback],
    }));
  };
  // add a callback to form submission success
  const addToSuccessForm = (callback) => {
    setCallbacks((cbs) => ({
      ...cbs,
      successFormCallbacks: [...cbs.successFormCallbacks, callback],
    }));
  };
  // add a callback to form submission failure
  const addToFailureForm = (callback) => {
    setCallbacks((cbs) => ({
      ...cbs,
      failureFormCallbacks: [...cbs.failureFormCallbacks, callback],
    }));
  };
  return {
    callbacks,
    addToSuccessForm,
    addToSubmitForm,
    addToFailureForm,
  };
};
