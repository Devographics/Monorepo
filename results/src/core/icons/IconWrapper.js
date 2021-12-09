import React from 'react'
import styled from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import Tooltip from 'core/components/Tooltip'

const Icon = styled.span`
    height: 24px;
    width: 24px;
    appearance: initial !important;
    ${(props) =>
        props.enableHover &&
        `
        &:hover {
            
        }
    `}
    svg {
        height: 100%;
        width: 100%;
        display: block;
        path, circle {
            fill: ${(props) => props.theme.colors.text};
        }
    }
`

const IconWithHover = styled(Icon)`
    &:hover {
        svg {
            path {
                fill: ${(props) => props.theme.colors.link};
            }
        }
    }
`

const IconWrapper = ({ enableHover = true, enableTooltip = true, labelId, label, children }) => {
    const { translate } = useI18n()
    const label_ = label || translate(labelId)
    const IconComponent = enableHover ? IconWithHover : Icon
    const icon = (
        <IconComponent>
            {children}
            <span className="sr-only">{label_}</span>
        </IconComponent>
    )
    return enableTooltip ? <Tooltip trigger={icon} contents={<span>{label_}</span>} /> : icon
}

export default IconWrapper
