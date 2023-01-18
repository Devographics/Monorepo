import { useBlockTransition } from "../useBlockTransition/useBlockTransition";
import debug from "debug";
import { useIntlContext } from "@vulcanjs/react-i18n";
const debugTransitions = debug("vn:route-transitions");

/**
 * Can trigger an alert on unsaved changes
 *
 * Triggers event so you can also block SPA transition (implementation is NOT provided by this hook, you
 * need listeners whose implementation depends on your router (React Router, Next Router...), see block.ts)
 *
 * @see https://github.com/ReactTraining/history/blob/master/docs/blocking-transitions.md
 *
 * @param param0
 */
export const useWarnOnUnsaved = ({
  isChanged,
  warnUnsavedChanges,
}: {
  isChanged: boolean;
  warnUnsavedChanges?: boolean;
}) => {
  const context = useIntlContext();
  /**
   * To be passed to onbeforeunload event. The returned message will be displayed
   * by the prompt.
   *
   * see https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
   * the message returned is actually ignored by most browsers and a default message 'Are you sure you want to leave this page? You might have unsaved changes' is displayed. See the Notes section on the mozilla docs above
   */
  const getBlockedMessage = (event?: BeforeUnloadEvent) => {
    debugTransitions("running handlePageLeave", event);
    const message = context.formatMessage({
      id: "forms.confirm_discard",
      defaultMessage: "Are you sure you want to discard your changes?",
    });
    return message;
  };
  useBlockTransition({
    shouldBlock: !!(warnUnsavedChanges && isChanged),
    getBlockedMessage: getBlockedMessage,
  });
};
