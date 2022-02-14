import React from 'react'
import styled, { css } from 'styled-components'
import { fontSize, spacing } from 'core/theme'

import * as Tooltip from '@radix-ui/react-tooltip'

const Content = styled(Tooltip.Content)`
    background: ${props => props.theme.colors.backgroundBackground};
    font-size: ${fontSize('small')};
    padding: ${spacing(0.3)} ${spacing(0.6)};
    border: 1px solid ${props => props.theme.colors.border};
    p:last-child{
        margin: 0;
    }
    // see https://www.joshwcomeau.com/css/designing-shadows/
    /* filter: drop-shadow(1px 2px 8px hsl(220deg 60% 50% / 0.3))
        drop-shadow(2px 4px 16px hsl(220deg 60% 50% / 0.3))
        drop-shadow(4px 8px 32px hsl(220deg 60% 50% / 0.3)); */
`

const Trigger = styled(Tooltip.Trigger)`
    background: none;
    border: none;
    padding: 0;
    display: inline-block;

    ${props => {
        if (props.$clickable) {
            return css`
                cursor: pointer;
            `
        }
    }}
`

const Arrow = styled(Tooltip.Arrow)`
    fill: ${props => props.theme.colors.backgroundBackground};
    stroke: ${props => props.theme.colors.text};
    stroke-width: 2px;
`

const Tip = ({ trigger, contents, asChild = true, clickable = false }) => (
    <Tooltip.Root delayDuration={200}>
        <Trigger asChild={asChild} $clickable={clickable}>
            {trigger}
        </Trigger>
        <Content side="top">
            {contents}
            {/* <Arrow /> */}
        </Content>
    </Tooltip.Root>
)

export default Tip
