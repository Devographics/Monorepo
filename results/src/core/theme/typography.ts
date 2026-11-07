import { css } from 'styled-components'

export const primaryFontMixin = css`
    font-family: var(--fontFamily);
    font-weight: var(--fontLight);
`

export const secondaryFontMixin = css`
    font-family: var(--secondaryFontFamily);
    letter-spacing: 2px;
    /* font-weight: var(--fontBold); */
`
