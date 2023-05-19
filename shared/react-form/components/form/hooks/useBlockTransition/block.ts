const BeforeUnloadEventType = "beforeunload";
/**
 * Event triggered when a warning on unsaved changes is necessary
 * The app should listen for this event to setup relevant blocking methods depending on the framework
 *
 * For instance with React Router:
 *
 * let unblock
 * window.addEventListener("blocktransition", () => {
 *    unblock = router.history.block(...)
 * })
 * window.addEventListener("unblocktransition", () => {
 *    unblock()
 * })
 *
 * For Next.js, you would do something similar
 * Check https://github.com/vercel/next.js/discussions/12348
 *
 */
export const BLOCK_TRANSITION_EVENT_TYPE = "blocktransition";
/**
 * Called when blocking is not necessary anymore:
 * - there are no unsaved changes anymore
 * - user has confirmed they want to leave
 */
export const UNBLOCK_TRANSITION_EVENT_TYPE = "unblocktransition";
/**
 * Intercepts the beforeunload event
 *
 * Code taken from React Router history feature
 * @see https://github.com/ReactTraining/history/blob/master/docs/blocking-transitions.md
 */
function blockBeforeUnload(event: BeforeUnloadEvent) {
  // Cancel the event.
  event.preventDefault();
  // Chrome (and legacy IE) requires returnValue to be set.
  event.returnValue = "";
}

/**
 * Blocks transition
 *
 * /!\ In order to catch SPA transition, you need to implement
 * an event listener in your own app.
 *
 *
 * @param onUnblock Callback to call on unblock, for custom behaviour
 * @returns A function to unblock the transition (eg if the form is back to
 * its original state)
 */
export const block = (
  setConfirmationMessage: (event?: BeforeUnloadEvent) => string,
  onUnblock?: Function
) => {
  // trigger a block event, to be handled at the framework level
  // TODO: setConfirmationMessage should be passed as well
  const blockEvent = new Event(BLOCK_TRANSITION_EVENT_TYPE);
  window.dispatchEvent(blockEvent);
  // block at browser level
  window.addEventListener(BeforeUnloadEventType, blockBeforeUnload);
  window.addEventListener(BeforeUnloadEventType, setConfirmationMessage);
  // return an unblock function to cancel
  const unblock = () => {
    if (onUnblock) {
      onUnblock(); // callback from user land
    }
    // trigger an unblock event, to be handled at the framework level
    const unblockEvent = new Event(UNBLOCK_TRANSITION_EVENT_TYPE);
    window.dispatchEvent(unblockEvent);
    // remove the browser level events
    window.removeEventListener(BeforeUnloadEventType, blockBeforeUnload);
    window.removeEventListener(BeforeUnloadEventType, setConfirmationMessage);
    // unblock browser change
    // @ts-ignore
    window.onbeforeunload = undefined; //undefined instead of null to support IE
  };
  return unblock;
};
