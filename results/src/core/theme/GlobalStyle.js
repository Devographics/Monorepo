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
            font-size: ${(props) => props.theme.typography.rootSize.mobile};
        }
        
        @media ${mq.large} {
            font-size: ${(props) => props.theme.typography.rootSize.desktop};
            min-height: 100vh;
        }
    }
    
    html {
        box-sizing: border-box;
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
        ${secondaryFontMixin}
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
        ${secondaryFontMixin}
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
    .Page--awards {
        .Page__Introduction{
            margin: 0;
            p{
                margin: 0;
            }
        }
        .Page__Contents{
            @media ${mq.mediumLarge} {
                width: 100%;
                display: grid;
                grid-template-columns: 1fr 1fr;
                column-gap: ${spacing(6)};
                row-gap: ${spacing(4)};
                
                .Page__Introduction {
                    grid-column: 1 / 3;
                }
            }
        }
    }
    .t-modkeydown{
        &.t-fallback, &.t-missing{
            ${textShadowHighlightMixin(colors.green, 0.05)}
            &:hover{
                cursor: pointer;
                ${textShadowHighlightMixin(colors.pink, 0.05)}
            }
        }
    }
    .hint-export-button{
        display: inline-block;
        font-weight: 800;
        border: 1px dashed;
        font-size: 0.8rem;
        padding: 4px 10px;
    }
    .hint-completion-indicator{
        display: inline-block;
        color: ${color('link')};
        font-size: 1.4rem;
    }
`
