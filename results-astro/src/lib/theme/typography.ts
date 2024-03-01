import { getTheme } from "./getTheme";

// TODO: we can't actually load that, we need CSS variables instead
export const secondaryFontMixin = () => `
    font-family: ${getTheme().typography.fontFamily2};
    letter-spacing: 2px;
    /* font-weight: ${getTheme().typography.weight.bold}; */
`