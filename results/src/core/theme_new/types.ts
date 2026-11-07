export type ColorScheme = {
    primary: {
        default: string
        darker: string
    }
    background: {
        default: string
        alt: string
        alt2: string
        inverted: string
        invertedAlt: string
    }
    text: {
        default: string
        alt: string
        inverted: string
        error: string
    }
    border: {
        default: string
        alt: string
        hover: string
    }
    distinct: string[]
    experience: {
        heard: string
        used: string
        never_heard: string
    }
    sentiment: {
        positive: string
        negative: string
        neutral: string
    }
    velocity: string[]
    // optional per-survey color for each section, keyed by section id
    // (sections differ between surveys, so the default theme doesn't define any)
    sections?: Record<string, string>
}

export type ColorTheme = {
    lightOnDark: ColorScheme
}

// arrays are kept whole since a survey's array replaces the default one entirely
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends any[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K]
}

// survey themes only define the colors they override
export type SurveyColorTheme = DeepPartial<ColorTheme>
