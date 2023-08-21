import { css } from 'styled-components'
import { transparentize } from 'polished'

export interface FancyLinkMixinProps {
    color: string
    activeClassName?: string
    activeColor: string
}

export const screenReadersOnlyMixin = css`
    border: 0;
    clip: rect(0 0 0 0);
    clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
    -webkit-clip-path: polygon(0px 0px, 0px 0px, 0px 0px);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    white-space: nowrap;
`

export const textShadowMixin = (color: string) => css`
    text-shadow: 0px 2px 3px ${transparentize(0.6, color)};
`

export const textShadowHighlightMixin = (color: string, transparency = 0.1) => css`
    text-shadow: 0px 2px 7px ${transparentize(transparency, color)};
`

export const fancyLinkMixin = ({
    color,
    activeClassName = '_is-active',
    activeColor
}: FancyLinkMixinProps) => css`
    position: relative;
    text-decoration: none;
    transition: all ease-in 300ms;

    &,
    &:link,
    &:visited,
    &:active,
    &:focus {
        color: ${color};
    }

    > span {
        display: inline-block;
        position: relative;

        &::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background-color: ${color};
            transform-origin: bottom right;
            transform: scaleX(0);
            transition: transform 0.5s ease;
        }
    }

    &.${activeClassName} {
        color: ${activeColor};

        > span::before {
            background-color: ${activeColor};
        }
    }

    &:hover,
    &:focus {
        text-decoration: none;

        > span::before {
            transform-origin: bottom left;
            transform: scaleX(1);
        }
    }
`

// Below is unsused and it does not return anything
// export const antsMixin = (background, foreground) => css`
//     /*
//         // via https://codepen.io/danichk/pen/PPRxrR
// @keyframes ants {
//     to {
//         background-position: 100% 100%;
//     }
// }

//         */
//     /*
//        border: 1px solid transparent;
//     background: linear-gradient($antsBg, $antsBg) padding-box,
//         repeating-linear-gradient(-45deg, $antsFg 0, $antsFg 25%, transparent 0, transparent 50%) 0 /
//             0.6em 0.6em;
//     animation: ants 12s linear infinite;
//     */
// `
