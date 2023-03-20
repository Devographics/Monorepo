import 'styled-components'
import {
    ToolExperienceId,
    ToolsSectionId,
    FeatureExperienceId,
    SimplifiedFeatureExperienceId,
    FeaturesSectionId,
    GenderId
} from 'core/bucket_keys'

declare module 'styled-components' {
    export interface DefaultTheme {
        separationBorder: string
        blockShadow: string
        border: string
        dimensions: {
            spacing: number
            sidebar: {
                width: number
            }
        }
        typography: {
            fontFamily: string
            fontFamily2: string
            rootSize: {
                mobile: string
                desktop: string
            }
            size: {
                smaller: string
                small: string
                smallish: string
                medium: string
                large: string
                larger: string
                largest: string
                huge: string
            }
            weight: {
                light: number
                medium: number
                bold: number
            }
        }
        colors: {
            tiers: string[]
            background: string
            backgroundBackground: string
            backgroundForeground: string
            backgroundAlt: string
            backgroundAlt2: string
            backgroundInverted: string
            backgroundInvertedAlt: string
            text: string
            textAlt: string
            textInverted: string
            textHighlight: string
            link: string
            linkActive: string
            linkHover: string
            contrast: string
            border: string
            heatmap: string
            lineChartDefaultColor: string
            barChart: {
                primary: string
                primaryGradient: [string, string]
                secondary: string
                secondaryGradient: [string, string]
            }
            ranges: {
                tools: Record<string>
                toolSections: Record<string>
                features: Record<string>
                features_categories: Record<string>
                features_simplified: Record<string>
                gender: Record<GenderId, string>
                opinions: {
                    4: string
                    3: string
                    2: string
                    1: string
                    0: string
                }
            }
            distinct: string[]
            velocity: string[]
            countries: string[]
        }
        charts: {
            fontFamily: string
            axis: {
                ticks: {
                    line: {
                        fill: string
                    }
                    text: {
                        fill: string
                    }
                }
                legend: {
                    text: {
                        fill: string
                    }
                }
            }
            streamTimelineAxis: {
                ticks: {
                    line: {
                        stroke: string
                    }
                    text: {
                        fill: string
                    }
                }
            }
            tooltip: {
                container: {
                    fontSize: number
                    background: string
                    color: string
                    borderRadius: number
                    boxShadow: string
                }
            }
            legends: {
                text: {
                    fill: string
                }
            }
        }
        zIndexes: {
            popover: number
            modal: number
        }
    }
}
