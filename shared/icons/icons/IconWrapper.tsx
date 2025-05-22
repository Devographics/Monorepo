import React from 'react'
import styled from 'styled-components'
import { Tooltip } from '@devographics/components'

const getIconSize = ({
    size = 'medium'
}: {
    size: 'small' | 'petite' | 'medium' | 'large' | string
}) => {
    switch (size) {
        case 'small':
            return '16px'
        case 'petite':
            return '18px'
        case 'medium':
            return '24px'
        case 'large':
            return '30px'
        default:
            console.warn(`Icon size ${size} is unknown, will use medium size`)
            return '24px'
    }
}

const Icon = styled.span`
    height: ${getIconSize};
    width: ${getIconSize};
    appearance: initial !important;
    display: block;
    background: none;
    border: none;
    padding: 0;
    ${props =>
        props.enableHover &&
        `
            &:hover {
                
            }
        `}
    svg {
        height: ${getIconSize};
        width: ${getIconSize};
        display: block;
    }
`

const IconWithHover = styled(Icon)`
    &:hover {
        svg {
            color: var(--linkColor);
        }
    }
`

export interface IconProps {
    className?: string
    enableHover?: boolean
    enableTooltip?: boolean
    labelId?: string
    label?: string | JSX.Element
    values?: any
    inSVG?: boolean
    size?: 'small' | 'petite' | 'medium' | 'large'
    onClick?: () => void
}

export interface IconWrapperProps extends IconProps {
    children: React.ReactElement
}
const IconWrapper = ({
    className = '',
    enableHover = false,
    enableTooltip = true,
    label,
    children,
    values,
    inSVG = false,
    onClick,
    size
}: IconWrapperProps) => {
    const isButton = !!onClick
    const IconComponent = enableHover ? IconWithHover : Icon

    const children_ = React.cloneElement(children, {
        'aria-hidden': true
    } as any)
    const icon = inSVG ? (
        <g>
            {children_}
            {/* <text className="sr-only">{label_}</text> */}
        </g>
    ) : (
        <IconComponent
            as={isButton ? 'button' : 'span'}
            onClick={onClick}
            size={size}
            className={`icon-wrapper ${className}`}
        >
            {children_}
            {label && <span className="sr-only">{label}</span>}
        </IconComponent>
    )
    return enableTooltip && label ? (
        <Tooltip trigger={icon} contents={<span>{label}</span>} />
    ) : (
        icon
    )
}

export default IconWrapper
