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
    | 'largerest'
    | 'smallest'

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

// these mixins return CSS variables defined in core/layout/LayoutWrapper.tsx

export const spacing = (multiplier = 1) =>
    multiplier === 1 ? 'var(--spacing)' : `calc(var(--spacing) * ${multiplier})`

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const fontSize = (size: SizeKeys) => `var(--fontSize${capitalize(size)})`

export const fontWeight = (weight: WeightKeys) => `var(--font${capitalize(weight)})`

export const color =
    (id: ColorKeys) =>
        ({ theme }: ThemeProps) =>
            theme.colors?.[id] as string

export const zIndex = (id: ZIndexKeys) => `var(--zIndex${capitalize(id)})`
