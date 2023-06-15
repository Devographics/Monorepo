import { renderHook, act } from "@testing-library/react-hooks";
import { useBlockTransition } from "../useBlockTransition";

describe("react-components/useBlockTransition", () => {
  const getBlockedMessage = () => "blocked";
  test("do nothing if not blocked initially", () => {
    // spy on blocktransition event
    const blockTransitionListener = jest.fn();
    window.addEventListener("blocktransition", blockTransitionListener);
    const unblockTransitionListener = jest.fn();
    window.addEventListener("unblocktransition", unblockTransitionListener);
    const beforeUnloadListener = jest.fn();
    window.addEventListener("beforeunload", beforeUnloadListener);

    const { result } = renderHook(() =>
      useBlockTransition({ shouldBlock: false, getBlockedMessage })
    );
    expect(result.current).toBeUndefined(); // no result
    // triggers an event for 3rd party libraries
    expect(blockTransitionListener).not.toHaveBeenCalled();
    expect(unblockTransitionListener).not.toHaveBeenCalled();
    // listen to unload event
    //window.dispatchEvent("n")
  });
  test("trigger block transition event for 3rd party SPA ", () => {
    // spy on blocktransition event
    const blockTransitionListener = jest.fn();
    window.addEventListener("blocktransition", blockTransitionListener);
    const unblockTransitionListener = jest.fn();
    window.addEventListener("unblocktransition", unblockTransitionListener);
    const beforeUnloadListener = jest.fn();
    window.addEventListener("beforeunload", beforeUnloadListener);

    const { result } = renderHook(() =>
      useBlockTransition({ shouldBlock: true, getBlockedMessage })
    );
    expect(result.current).toBeUndefined(); // no result
    // triggers an event for 3rd party libraries
    expect(blockTransitionListener).toHaveBeenCalledTimes(1);
    expect(unblockTransitionListener).not.toHaveBeenCalled();
    // listen to unload event
    //window.dispatchEvent("n")
  });
  test("trigger unblock transition  event for 3rd party SPA after it was being blocked", () => {
    // spy on blocktransition event
    const blockTransitionListener = jest.fn();
    window.addEventListener("blocktransition", blockTransitionListener);
    const unblockTransitionListener = jest.fn();
    window.addEventListener("unblocktransition", unblockTransitionListener);
    // const beforeUnloadListener = jest.fn();
    // window.addEventListener("beforeunload", beforeUnloadListener);
    const { result, rerender } = renderHook(
      (props) => useBlockTransition(props),
      { initialProps: { shouldBlock: true, getBlockedMessage } }
    );
    rerender({ shouldBlock: false, getBlockedMessage });
    // triggers an event for 3rd party libraries
    expect(blockTransitionListener).toHaveBeenCalledTimes(1);
    expect(unblockTransitionListener).toHaveBeenCalledTimes(1);
  });
  test("correctly block browser transition", () => {
    const getBlockedMessage = jest.fn(() => "blocked");
    // spy on blocktransition event
    const blockTransitionListener = jest.fn();
    window.addEventListener("blocktransition", blockTransitionListener);
    const unblockTransitionListener = jest.fn();
    window.addEventListener("unblocktransition", unblockTransitionListener);
    const beforeUnloadListener = jest.fn();
    window.addEventListener("beforeunload", beforeUnloadListener);

    const { result } = renderHook(() =>
      useBlockTransition({ shouldBlock: true, getBlockedMessage })
    );

    // try to leave the page
    let evt = new Event("beforeunload");
    evt.preventDefault = jest.fn();
    window.dispatchEvent(evt);
    // event listener should be applied
    expect(evt.preventDefault).toHaveBeenCalled();
    expect(getBlockedMessage).toHaveBeenCalled();
    // won't work for some reason, it's probably already processed by the DOM when we check this
    // expect(evt.returnValue).toEqual("blocked");
  });
  test("correctly unblock browser transition", () => {
    const getBlockedMessage = jest.fn(() => "blocked");
    // spy on blocktransition event
    const blockTransitionListener = jest.fn();
    window.addEventListener("blocktransition", blockTransitionListener);
    const unblockTransitionListener = jest.fn();
    window.addEventListener("unblocktransition", unblockTransitionListener);
    const beforeUnloadListener = jest.fn();
    window.addEventListener("beforeunload", beforeUnloadListener);

    const { result, rerender } = renderHook(
      (props) => useBlockTransition(props),
      { initialProps: { shouldBlock: true, getBlockedMessage } }
    );
    rerender({ shouldBlock: false, getBlockedMessage });

    // try to leave the page
    let evt = new Event("beforeunload");
    evt.preventDefault = jest.fn();
    window.dispatchEvent(evt);
    // event listener should be applied
    expect(evt.preventDefault).not.toHaveBeenCalled();
    expect(getBlockedMessage).not.toHaveBeenCalled();
    // won't work for some reason, it's probably already processed by the DOM when we check this
    // expect(evt.returnValue).toEqual("blocked");
  });
});
