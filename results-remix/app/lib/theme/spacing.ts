import { getTheme } from "./getTheme"

export const spacing =
    (multiplier = 1) => getTheme().dimensions.spacing * multiplier + "px"