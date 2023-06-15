import { useEffect, useRef } from "react";
import { block } from "./block";

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
    const onUnblock = () => {
      if (!shouldBlock) {
        if (unblockRef.current) {
          unblockRef.current();
        }
      }
    };
    // block
    const onBlocked = (evt?: BeforeUnloadEvent): string => {
      const message = getBlockedMessage(evt);
      if (evt) {
        evt.returnValue = message;
      }
      return message;
    };
    if (shouldBlock) {
      unblockRef.current = block(onBlocked, onUnblock);
    }
    // unblock if not blocking anymore and was blocking previously
    if (!shouldBlock && isBlocking) {
      if (unblockRef.current) {
        unblockRef.current();
      }
    }
    // trigger the potentially registered unblock function when component unmounts
    //return onUnblock;
  }, [shouldBlock]);
};
