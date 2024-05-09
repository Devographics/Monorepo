import React from 'react'
import styled from 'styled-components'
import { useI18n } from '@devographics/react-i18n'
import Tooltip from 'core/components/Tooltip'

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
        color: ${props => props.theme.colors.text};
        /* path, circle {
                fill: ${props => props.theme.colors.text};
            } */
    }
`

const IconWithHover = styled(Icon)`
    &:hover {
        svg {
            color: ${props => props.theme.colors.link};
        }
    }
`

export interface IconProps {
    className?: string
    enableHover?: boolean
    enableTooltip?: boolean
    labelId?: string
    label?: string
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
    labelId,
    label,
    children,
    values,
    inSVG = false,
    onClick,
    size
}: IconWrapperProps) => {
    const { getString } = useI18n()
    const label_ = label || (labelId && getString(labelId, { values })?.t) || ''

    const isButton = !!onClick
    const IconComponent = enableHover ? IconWithHover : Icon
    const icon = inSVG ? (
        <g>
            {children}
            {/* <text className="sr-only">{label_}</text> */}
        </g>
    ) : (
        <IconComponent
            as={isButton ? 'button' : 'span'}
            onClick={onClick}
            size={size}
            className={`icon-wrapper ${className}`}
        >
            {children}
            <span className="sr-only">{label_}</span>
        </IconComponent>
    )
    return enableTooltip && label_ ? (
        <Tooltip trigger={icon} contents={<span>{label_}</span>} />
    ) : (
        icon
    )
}

export default IconWrapper
