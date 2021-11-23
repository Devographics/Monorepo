import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { navigate } from 'gatsby'
import { fontWeight } from 'core/theme'

const PeriodicElement = ({ className, name = '', symbol, number, size, path, x, y }) => {
    return (
        <svg
            width={size || '100%'}
            height={size}
            x={x}
            y={y}
            viewBox={`0 0 100 100`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            onClick={() => {
                if (path) {
                    navigate(path)
                }
            }}
        >
            <Frame x="0" y="0" width="100" height="100" />
            <NumberNode x={100 * 0.1} y={100 * 0.2} fontSize={100 * 0.14}>
                {number}
            </NumberNode>
            <Symbol
                x={100 * 0.5}
                y={name ? 100 * 0.55 : 100 * 0.6}
                width="100%"
                textAnchor="middle"
                fontSize={100 * 0.36}
            >
                {symbol}
            </Symbol>
            <Label
                x={100 * 0.5}
                y={100 * 0.78}
                fontSize={100 * (name.length > 10 ? 0.09 : 0.14)}
                textAnchor="middle"
            >
                {name}
            </Label>
        </svg>
    )
}

PeriodicElement.propTypes = {
    name: PropTypes.string,
    symbol: PropTypes.string.isRequired,
}

const Frame = styled.rect`
    stroke-width: 1px;
    stroke: ${({ theme }) => theme.colors.border};
    fill: ${({ theme }) => theme.colors.background};
`

const NumberNode = styled.text`
    opacity: 0.6;
    pointer-events: none;
    fill: white;
`

const Symbol = styled.text`
    font-weight: ${fontWeight('bold')};
    pointer-events: none;
    fill: ${({ theme }) => theme.colors.link};
`

const Label = styled.text`
    opacity: 0.6;
    pointer-events: none;
    fill: ${({ theme }) => theme.colors.text};
`

export default PeriodicElement
