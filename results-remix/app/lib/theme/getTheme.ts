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

export type WeightKeys = 'light' | 'medium' | 'bold'

export type ColorKeys =
    | 'background'
    | 'backgroundBackground'
    | 'backgroundForeground'
    | 'backgroundAlt'
    | 'backgroundAlt2'
    | 'backgroundInverted'
    | 'backgroundInvertedAlt'
    | 'text'
    | 'textAlt'
    | 'textInverted'
    | 'textHighlight'
    | 'link'
    | 'linkActive'
    | 'linkHover'
    | 'contrast'
    | 'border'
    | 'heatmap'
    | 'lineChartDefaultColor'
    | 'barChart'
    | 'ranges'
    | 'distinct'
    | 'velocity'
    | 'countries'
    | 'hover'
    | "backgroundAlt3"
export interface Theme {
    typography: {
        fontFamily2: string,
        /** size[smaller]: "8px" */
        size: { [key in SizeKeys]?: string }
        weight: {
            [key in WeightKeys]?: string
        }
    },
    dimensions: {
        /** pixels */
        spacing: number,
        sidebar: {
            width: number
        }
    },
    colors: {
        [key in ColorKeys]?: string
    }
}
const defaultTheme: Theme = {
    typography: {
        fontFamily2: "Arial",
        size: {},
        weight: {
            light: "400",
            medium: "400",
            bold: "400",
        }
    },
    dimensions: {
        spacing: 4,
        sidebar: {
            width: 100
        }
    },
    colors: {
        link: "#000000"
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