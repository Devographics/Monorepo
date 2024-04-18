import { css } from 'styled-components'

export const primaryFontMixin = css`
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-weight: ${({ theme }) => theme.typography.weight.light};
`

export const secondaryFontMixin = css`
    font-family: ${({ theme }) => theme.typography.fontFamily2};
    letter-spacing: 2px;
    /* font-weight: ${({ theme }) => theme.typography.weight.bold}; */
`
