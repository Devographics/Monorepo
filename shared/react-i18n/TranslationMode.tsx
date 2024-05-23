/**
 * This translation scripts bypasses React and avoids the need
 * to add containers everywhere in the DOM
 *
 * Must be used with a client direction to use some JS code
 *
 * TODO:  this is just a prototype to show how we can detect translation strings
 * 
 * it's not doing much currently
 * + we could make the input a React component rendered where the translation token is
 * or make it a link that opens another tab but that's more cumbersome
 */

// TODO: create Portal might be usable to avoid having many React roots?
// but need to play around with declaratively rendering each portal in a loop
// import { createPortal } from "react-dom"
import { createRoot } from "react-dom/client"
import { DATA_TOKEN_ATTR, TOKEN_DATASET } from "@devographics/i18n";


function enableTranslation() {
  console.log("Enabling translations");
  document.querySelectorAll(`[${DATA_TOKEN_ATTR}]`).forEach((el: Element) => {
    console.debug("Found a translated element", el);
    if (!(el instanceof HTMLElement)) {
      console.warn(
        "Found a translation element which is not an HTMLElement",
        el,
      );
      return;
    }
    const key = el.dataset?.[TOKEN_DATASET];
    if (!key) {
      console.warn("Found a translation element with an empty key", el);
      return;
    }
    createRoot(el).render(<TestInput val={key} />)
  });
}

function TestInput({ val }: { val: string }) {
  return <div>
    <form>
      <input defaultValue={val} />
      <button type="submit">V</button>
    </form>
  </div>
}

export function TranslationMode() {
  return (
    <button onClick={() => {
      enableTranslation()
    }}>Enable translation mode</button>
  )
}

