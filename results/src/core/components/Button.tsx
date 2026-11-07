import styled, { css } from 'styled-components'
import { mq } from 'core/theme'
import ButtonGroup from './ButtonGroup'
import { getThemeColor } from 'core/theme_new/colors'

const Button = styled.button.attrs(
    ({ className, size = 'medium', variant = 'default', ...props }) => {
        return {
            className: `Button${className ? ` ${className}` : ''} Button-${variant}`
        }
    }
)`
    // variants
    ${({ variant }) => {
        if (variant === 'link') {
            return css`
                color: var(--linkColor) !important;
                padding: 0 !important;
                display: inline-block !important;
                font-weight: var(--fontBold) !important;
                border: none !important;
                background: none !important;
                cursor: pointer !important;
            `
        } else {
            // default
            return css`
                background: none;
                cursor: pointer;
                display: flex;
                justify-content: center;
                gap: 5px;
                align-items: center;
                text-align: center;
                font-weight: var(--fontBold);
                border: 1px dashed;
                box-shadow: 0 0 0 rgba(0, 0, 0, 0);
                transition: all 300ms ease-out;

                /* text-transform: uppercase; */
                /* letter-spacing: 1.5px; */

                &,
                &:link,
                &:visited {
                    text-decoration: none;
                    border-color: ${getThemeColor('text.default')};
                    color: ${getThemeColor('text.default')};
                }

                &:hover,
                &:focus {
                    border-style: solid;
                    border-color: ${getThemeColor('primary.default')};
                    color: ${getThemeColor('primary.default')};
                    svg {
                        color: ${getThemeColor('primary.default')} !important;
                    }
                }
                // sizing
                ${props => {
                    if (props.size === 'small') {
                        return css`
                            font-size: var(--fontSizeSmall);
                            padding: calc(var(--spacing) * 0.2) var(--halfSpacing);
                        `
                    }

                    if (props.size === 'large') {
                        return css`
                            @media ${mq.small} {
                                font-size: var(--fontSizeLarge);
                                padding: calc(var(--spacing) * 0.75);
                            }

                            @media ${mq.mediumLarge} {
                                font-size: var(--fontSizeLarger);
                                padding: var(--spacing);
                            }
                        `
                    }

                    return css`
                        padding: var(--halfSpacing) var(--spacing);

                        @media ${mq.small} {
                            font-size: var(--fontSizeSmall);
                        }

                        @media ${mq.mediumLarge} {
                            font-size: var(--fontSizeMedium);
                        }
                    `
                }}

                &:hover, &:focus {
                    text-decoration: none;
                    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.3);
                    background: var(--backgroundAltColor);
                }

                &.Button--selected {
                    background: var(--backgroundAltColor);
                    cursor: default;
                    pointer-events: none;
                    border-style: solid;
                    .secondary-bg & {
                        background: ${getThemeColor('background.alt2')};
                    }
                }
            `
        }
    }}

    ${ButtonGroup} & {
        /* white-space: nowrap; */
        &--active {
            cursor: default;
            pointer-events: none;
        }
        @media ${mq.small} {
            width: 100%;
            flex-basis: 100%;
            /* font-size: var(--fontSizeSmallest); */
            &:first-child {
                border-top-width: 1px;
            }

            &:hover,
            &:focus {
                border-top-color: ${getThemeColor('border.default')};
                border-bottom-color: ${getThemeColor('border.default')};

                &:first-child {
                    border-top-color: ${getThemeColor('primary.default')};
                }
                &:last-child {
                    border-bottom-color: ${getThemeColor('primary.default')};
                }
            }
        }

        @media ${mq.mediumLarge} {
            border-left-width: 0;
            &:first-child,
            .chart-toggle-wrap & {
                border-left-width: 1px;
            }

            &:hover,
            &:focus {
                border-left-color: ${getThemeColor('border.default')};
                border-right-color: ${getThemeColor('border.default')};

                &:first-child {
                    border-left-color: ${getThemeColor('border.hover')};
                }
                &:last-child {
                    border-right-color: ${getThemeColor('border.hover')};
                }
            }
        }
    }
`

export default Button
