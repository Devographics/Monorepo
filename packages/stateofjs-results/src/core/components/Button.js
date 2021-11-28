import styled, { css } from 'styled-components'
import { mq, fontSize, fontWeight, spacing, color } from 'core/theme'
import ButtonGroup from './ButtonGroup'

const Button = styled.button.attrs(({ className, size = 'medium', variant = 'default', ...props }) => {
    return {
        className: `Button${className ? ` ${className}` : ''}`,
    }
})`
    background: none;
    cursor: pointer;
    display: block;
    text-align: center;
    font-weight: ${fontWeight('bold')};
    border: 1px dashed;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    transition: all 300ms ease-out;

    &,
    &:link,
    &:visited {
        text-decoration: none;
    }

    // sizing
    ${(props) => {
        if (props.size === 'small') {
            return css`
                font-size: ${fontSize('small')};
                padding: ${spacing(0.2)} ${spacing(0.5)};
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
            padding: ${spacing(0.5)} ${spacing(1)};

            @media ${mq.small} {
                font-size: ${fontSize('small')};
            }

            @media ${mq.mediumLarge} {
                font-size: ${fontSize('medium')};
            }
        `
    }}

    // variants
    ${(props) => {
        // default
        return css`
            &,
            &:link,
            &:visited {
                border-color: ${color('text')};
                color: ${color('text')};
            }

            &:hover, &:focus {
                border-style: solid;
                border-color: ${color('link')};
                color: ${color('link')};
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
    }

    ${ButtonGroup} & {
        @media ${mq.small} {
            width: 100%;
            flex-basis: 100%;
            border-top-width: 0;
            &:first-child {
                border-top-width: 1px;
            }

            &:hover, &:focus {
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
            &:first-child {
                border-left-width: 1px;
            }

            &:hover, &:focus {
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

    ${ButtonGroup} {
        & {
            &--active {
                cursor: default;
                pointer-events: none;
            }
        }
    }
`

export default Button
