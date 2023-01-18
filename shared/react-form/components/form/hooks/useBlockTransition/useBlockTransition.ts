import { useEffect, useRef } from "react";
import { block } from "./block";
import debug from "debug";
const debugTransitions = debug("vn:router-transitions");

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
export const useBlockTransition = ({
  shouldBlock,
  getBlockedMessage,
}: {
  shouldBlock: boolean;
  getBlockedMessage: (evt?: BeforeUnloadEvent) => string;
}) => {
  // function to unblock the form
  const unblockRef = useRef<Function | undefined>();

  useEffect(() => {
    const isBlocking = !!unblockRef.current;
    debugTransitions(
      "running effect",
      "should block",
      shouldBlock,
      "currently blocked",
      isBlocking
    );

    const onUnblock = () => {
      debugTransitions("running unblock from effect");
      if (!shouldBlock) {
        if (unblockRef.current) {
          unblockRef.current();
        }
      }
    };
    // block
    const onBlocked = (evt?: BeforeUnloadEvent): string => {
      const message = getBlockedMessage(evt);
      debugTransitions(
        "user is being blocked after trying to leave the page, with message: " +
          message
      );
      if (evt) {
        evt.returnValue = message;
      }
      return message;
    };
    if (shouldBlock) {
      debugTransitions(
        "should block transition, setting up relevant event listener"
      );
      unblockRef.current = block(onBlocked, onUnblock);
    }
    // unblock if not blocking anymore and was blocking previously
    if (!shouldBlock && isBlocking) {
      debugTransitions("should unblock (state has been reinitialized)");
      if (unblockRef.current) {
        unblockRef.current();
      }
    }
    // trigger the potentially registered unblock function when component unmounts
    //return onUnblock;
  }, [shouldBlock]);
};
