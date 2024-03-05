export type SizeKeys =
    | 'smaller'
    | 'small'
    | 'smallish'
    | 'medium'
    | 'large'
    | 'larger'
    | 'largest'
    | 'huge'
    | "largerest"
export interface Theme {
    typography: {
        fontFamily2: string,
        /** size[smaller]: "8px" */
        size: { [key in SizeKeys]?: string }
        weight: {
            bold: "400"
        }
    }
}
const defaultTheme: Theme = {
    typography: {
        fontFamily2: "Arial",
        size: {},
        weight: {
            bold: "400"
        }
    }
}
export type ThemeConfig = Theme

let theme: Theme | null = null

export function initTheme(themeConfig?: ThemeConfig): Theme {
    theme = themeConfig || defaultTheme
    return theme
}
export function getTheme(): Theme {
    if (!theme) {
        throw new Error("Called getTheme before it was initialized")
    }
    return theme
}