import React, { useState } from 'react'
import { useSpring, animated, config } from 'react-spring'
import styled from 'styled-components'

interface CellProps {
    x0?: number
    y0?: number
    x1?: number
    y1?: number
    size: number
    children: string
    color?: 'text' | 'link' | 'contrast'
    index?: number
    isMainCell?: boolean
    delay?: number
}

const GLOBAL_INITIAL_DELAY = 0

const Cell = ({
    size,
    children,
    x0 = 0,
    y0 = 0,
    x1 = 0,
    y1 = 0,
    color = 'text',
    index,
    isMainCell,
    delay = 0,
}: CellProps) => {
    const finalSize = isMainCell ? size * 2 : size
    const fontSize = finalSize * 0.36
    const indexFontSize = finalSize * 0.18

    const style = useSpring({
        from: { opacity: 0, transform: `translate(${x0 * size},${y0 * size})` },
        to: { opacity: 1, transform: `translate(${x1 * size},${y1 * size})` },
        delay: GLOBAL_INITIAL_DELAY + delay * 60,
        config: config.wobbly,
    })

    return (
        <animated.g transform={style.transform} opacity={style.opacity}>
            <CellRect width={finalSize} height={finalSize} />
            {!isMainCell && (
                <CellIndex
                    x={finalSize * 0.1}
                    y={finalSize * 0.25}
                    style={{
                        fontSize: indexFontSize,
                    }}
                >
                    {index}
                </CellIndex>
            )}
            {!isMainCell && (
                <CellText
                    x={finalSize / 2}
                    y={finalSize / 2}
                    dy={fontSize * 0.36}
                    textAnchor="middle"
                    color={color}
                    style={{
                        fontSize,
                    }}
                >
                    {children}
                </CellText>
            )}
            {isMainCell && (
                <CellText
                    x={finalSize * 0.94}
                    y={finalSize * 0.9}
                    textAnchor="end"
                    color={color}
                    style={{
                        fontSize: finalSize * 0.56,
                        fontWeight: 600,
                    }}
                >
                    {children}
                </CellText>
            )}
        </animated.g>
    )
}

const CellRect = styled.rect`
    fill: ${(props) => props.theme.colors.background};
    stroke-width: 1px;
    stroke: ${(props) => props.theme.colors.border};
    cursor: pointer;

    &:hover {
        fill: ${(props) => props.theme.colors.backgroundAlt};
    }
`

const CellText = styled.text<{
    color: Exclude<CellProps['color'], undefined>
}>`
    fill: ${(props) => props.theme.colors[props.color]};
    font-weight: 500;
    pointer-events: none;
`

const CellIndex = styled.text`
    fill: ${(props) => props.theme.colors.text};
    font-weight: 300;
    pointer-events: none;
    opacity: 0.5;
`

export const IntroLogo = () => {
    const [key, setKey] = useState(0)
    const size = 300
    const cellSize = size / 4

    return (
        <Container>
            <svg
                key={key}
                onClick={() => setKey((prev) => prev + 1)}
                xmlns="http://www.w3.org/2000/svg"
                width={size + 4}
                height={size + 4}
            >
                <g transform="translate(2,2)">
                    <Cell size={cellSize} x0={2} x1={1} index={1}>
                        St
                    </Cell>
                    <Cell size={cellSize} x0={3} x1={2} index={2} delay={1}>
                        At
                    </Cell>
                    <Cell size={cellSize} x0={3} x1={3} y1={1} index={3} delay={2}>
                        E
                    </Cell>
                    <Cell size={cellSize} y0={2} y1={1} index={4} color="link" delay={4}>
                        Of
                    </Cell>
                    <Cell size={cellSize} x0={1} x1={1} y0={2} y1={1} isMainCell delay={6}>
                        JS
                    </Cell>
                    <Cell
                        size={cellSize}
                        x0={1}
                        x1={2}
                        y0={3}
                        y1={3}
                        color="contrast"
                        index={5}
                        delay={8}
                    >
                        20
                    </Cell>
                    <Cell
                        size={cellSize}
                        x0={3}
                        x1={3}
                        y0={3}
                        y1={2}
                        color="contrast"
                        index={6}
                        delay={9}
                    >
                        20
                    </Cell>
                </g>
            </svg>
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    justify-content: center;
    margin: 40px 0;
`

export default IntroLogo