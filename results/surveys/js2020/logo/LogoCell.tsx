import React from 'react'
import styled from 'styled-components'
import { mq } from 'core/theme'
import colors from '../theme/colors'

interface LogoCellProps {
    index: number
    text: string
    color: string
}

export const LogoCell = ({ index, text, color: textColor }: LogoCellProps) => (
    <Container className="LogoCell" style={{ color: textColor }}>
        <Index>{index}</Index>
        {text}
    </Container>
)

const Container = styled.span`
    width: 67px;
    height: 67px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    position: relative;
    border-left: var(--separationBorder);
    background: ${colors.background};
    text-decoration: none;

    .Logo:hover & {
        background: ${colors.backgroundAlt};
    }

    @media ${mq.smallMedium} {
        &:last-child {
            border-right: var(--separationBorder);
        }
    }

    @media ${mq.large} {
        &:first-child {
            border-left: 0;
        }
    }
`

const Index = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    font-size: 12px;
    line-height: 12px;
    padding: 6px 8px;
    color: ${colors.text};
    opacity: 0.35;
    font-weight: 300;
`

export default LogoCell