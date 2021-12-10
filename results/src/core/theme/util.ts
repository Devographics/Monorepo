import { DefaultTheme } from 'styled-components'

export interface ThemeProps {
    theme: DefaultTheme
}

type SizeKeys =
    | 'smaller'
    | 'small'
    | 'smallish'
    | 'medium'
    | 'large'
    | 'larger'
    | 'largest'
    | 'huge'

type WeightKeys = 'light' | 'medium' | 'bold'

type ColorKeys =
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

type ZIndexKeys = 'popover' | 'modal'

export const spacing =
    (multiplier = 1) =>
    ({ theme }: ThemeProps) =>
        `${theme.dimensions.spacing * multiplier}px`

export const fontSize =
    (size: SizeKeys) =>
    ({ theme }: ThemeProps) =>
        theme.typography.size[size]

export const fontWeight =
    (weight: WeightKeys) =>
    ({ theme }: ThemeProps) =>
        theme.typography.weight[weight]

export const color =
    (id: ColorKeys) =>
    ({ theme }: ThemeProps) =>
        theme.colors[id]

export const zIndex =
    (id: ZIndexKeys) =>
    ({ theme }: ThemeProps) =>
        theme.zIndexes[id]
