import { createGlobalStyle } from 'styled-components'
import { color, spacing, fontWeight, zIndex } from './util'
import { primaryFontMixin, secondaryFontMixin } from './typography'
import { textShadowHighlightMixin } from './mixins'
import mq from './mq'
import colors from './colors'

export const GlobalStyle = createGlobalStyle`
    body {
        background: ${color('background')};
        color: ${color('text')};
        padding: 0;
        font-feature-settings: 'liga' 0;
        line-height: 1.7;
        ${primaryFontMixin};
        
        @media ${mq.small} {
            font-size: ${props => props.theme.typography.rootSize.mobile};
        }
        
        @media ${mq.large} {
            font-size: ${props => props.theme.typography.rootSize.desktop};
            min-height: 100vh;
        }
    }
    
    html {
        box-sizing: border-box;
        color-scheme: dark;
    }
    
    *,
    *:before,
    *:after {
        box-sizing: inherit;
    }
    
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        /* ${secondaryFontMixin} */
        margin: 0 0 ${spacing()} 0;
    }
    
    a {
        text-decoration: none;
        font-weight: ${fontWeight('bold')};
        
        &,
        &:link,
        &:visited,
        &:active,
        &:focus {
            color: ${color('link')};
        }
        
        &:hover, &:focus {
            text-decoration: underline;
            color: ${color('linkHover')};
        }
    }
    
    p,
    ul,
    ol {
        margin: 0 0 ${spacing()} 0;
        
        @media ${mq.small} {
            line-height: 1.6;
        }
        
        @media ${mq.mediumLarge} {
            line-height: 1.8;
        }
    }
    
    pre,
    code {
    }
    
    .desktop {
        @media ${mq.small} {
            display: none;
        }
    }
    
    .mobile {
        @media ${mq.mediumLarge} {
            display: none;
        }
    }
    
    iframe {
        display: none;
    }
    
    .ModalContent {
        outline: none;
    }
    .ReactModal__Overlay {
        z-index: ${zIndex('modal')};
    }
    .ReactModal__Body--open{
        overflow: hidden;
    }
    .t-modkeydown{
        &.t-isFallback, &.t-missing{
            ${textShadowHighlightMixin(colors.green, 0.05)}
            &:hover{
                cursor: pointer;
                ${textShadowHighlightMixin(colors.pink, 0.05)}
            }
        }
    }
    .hint-icon {
        &:before{
            content: " ";
            display: inline-block;
            height: 16px;
            width: 16px;
            filter: invert(93%) sepia(12%) saturate(653%) hue-rotate(317deg) brightness(105%) contrast(103%);
            margin-right: 8px;
            transform: translateY(3px);
        }
        &.hint-export-button:before{
            background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path d='M464 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zM232 432H54a6 6 0 0 1-6-6V296h184v136zm0-184H48V112h184v136zm226 184H280V296h184v130a6 6 0 0 1-6 6zm6-184H280V112h184v136z'></path></svg>");
        }
        &.hint-share-button:before{
            background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path d='M568.482 177.448L424.479 313.433C409.3 327.768 384 317.14 384 295.985v-71.963c-144.575.97-205.566 35.113-164.775 171.353 4.483 14.973-12.846 26.567-25.006 17.33C155.252 383.105 120 326.488 120 269.339c0-143.937 117.599-172.5 264-173.312V24.012c0-21.174 25.317-31.768 40.479-17.448l144.003 135.988c10.02 9.463 10.028 25.425 0 34.896zM384 379.128V448H64V128h50.916a11.99 11.99 0 0 0 8.648-3.693c14.953-15.568 32.237-27.89 51.014-37.676C185.708 80.83 181.584 64 169.033 64H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48v-88.806c0-8.288-8.197-14.066-16.011-11.302a71.83 71.83 0 0 1-34.189 3.377c-7.27-1.046-13.8 4.514-13.8 11.859z'></path></svg>");

        }
    }

    .hint-bracket {
        display: grid;
        grid-template-columns: 1fr 100px;
        .hint-text{
            margin-right: ${spacing()};
        }
        .hint-diagram{
            background: url("/images/bracket_diagram.svg");
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center center;
            height: 100px;
            width: 100px;
            filter: invert(93%) sepia(12%) saturate(653%) hue-rotate(317deg) brightness(105%) contrast(103%);
        }
    }
    
    .hint-completion-indicator{
        display: inline-block;
        color: ${color('link')};
        font-size: 1.4rem;
    }
`
