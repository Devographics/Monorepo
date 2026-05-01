import styled, { css } from 'styled-components'
import { mq, fontSize, fontWeight, spacing, color } from 'core/theme'
import ButtonGroup from './ButtonGroup'

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
                    border-color: ${color('text')};
                    color: ${color('text')};
                }

                &:hover,
                &:focus {
                    border-style: solid;
                    border-color: ${color('link')};
                    color: ${color('link')};
                    svg {
                        color: ${color('link')} !important;
                    }
                }
                // sizing
                ${props => {
                    if (props.size === 'small') {
                        return css`
                            font-size: var(--fontSizeSmall);
                            padding: ${spacing(0.2)} var(--halfSpacing);
                        `
                    }

                    if (props.size === 'large') {
                        return css`
                            @media ${mq.small} {
                                font-size: ${fontSize('large')};
                                padding: ${spacing(0.75)};
                            }

                            @media ${mq.mediumLarge} {
                                font-size: ${fontSize('larger')};
                                padding: ${spacing(1)};
                            }
                        `
                    }

                    return css`
                        padding: var(--halfSpacing) ${spacing(1)};

                        @media ${mq.small} {
                            font-size: var(--fontSizeSmall);
                        }

                        @media ${mq.mediumLarge} {
                            font-size: ${fontSize('medium')};
                        }
                    `
                }}

                &:hover, &:focus {
                    text-decoration: none;
                    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.3);
                    background: ${color('backgroundAlt')};
                }

                &.Button--selected {
                    background: ${color('backgroundAlt')};
                    cursor: default;
                    pointer-events: none;
                    border-style: solid;
                    .secondary-bg & {
                        background: ${color('backgroundAlt2')};
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
            /* font-size: ${fontSize('smallest')}; */
            &:first-child {
                border-top-width: 1px;
            }

            &:hover,
            &:focus {
                border-top-color: ${color('border')};
                border-bottom-color: ${color('border')};

                &:first-child {
                    border-top-color: ${color('hover')};
                }
                &:last-child {
                    border-bottom-color: ${color('hover')};
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
                border-left-color: ${color('border')};
                border-right-color: ${color('border')};

                &:first-child {
                    border-left-color: ${color('hover')};
                }
                &:last-child {
                    border-right-color: ${color('hover')};
                }
            }
        }
    }
`

export default Button
