import React from 'react'
import styled from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import Tooltip from 'core/components/Tooltip'

const getIconSize = ({ size = 'medium' }) => {
    switch (size) {
        case 'small':
            return '16px'
        case 'medium':
            return '24px'
        case 'large':
            return '30px'
    }
}

const Icon = styled.span`
    height: ${getIconSize};
    width: ${getIconSize};
    appearance: initial !important;
    display: block;
    ${props =>
        props.enableHover &&
        `
        &:hover {
            
        }
    `}
    svg {
        height: 100%;
        width: 100%;
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
            path {
                fill: ${props => props.theme.colors.link};
            }
        }
    }
`

const IconWrapper = ({
    enableHover = true,
    enableTooltip = true,
    labelId,
    label,
    children,
    size
}) => {
    const { translate } = useI18n()
    const label_ = label || translate(labelId)
    const IconComponent = enableHover ? IconWithHover : Icon
    const icon = (
        <IconComponent size={size}>
            {children}
            <span className="sr-only">{label_}</span>
        </IconComponent>
    )
    return enableTooltip ? <Tooltip trigger={icon} contents={<span>{label_}</span>} /> : icon
}

export default IconWrapper
