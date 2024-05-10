import { type SizeKeys, type WeightKeys, getTheme } from "./getTheme";

// TODO: we can't actually load that, we need CSS variables instead
export const secondaryFontMixin = () => `
    font-family: ${getTheme().typography.fontFamily2};
    letter-spacing: 2px;
    /* font-weight: ${getTheme().typography.weight.bold}; */
`


export const fontSize =
    (size: SizeKeys) => {
        const themeSize = getTheme().typography.size[size]
        if (!themeSize) {
            console.warn("Theme has no typography size", themeSize)
            return "16px"
        }
        return themeSize
    }

export const fontWeight =
    (weight: WeightKeys) =>
        getTheme().typography.weight[weight]