import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from 'styled-components'

/**
 * This component is used to render a custom label for charts,
 * its main advantage is to add an outline to the labels so
 * they are more legible.
 */
const ChartLabel = ({
    label,
    fontSize = 13,
    outlineColor: _outlineColor,
    textColor: _textColor,
    ...rest
}) => {
    const theme = useTheme()

    const outlineColor = _outlineColor || theme.colors.background
    const textColor = _textColor || theme.colors.text

    return (
        <g {...rest}>
            <text
                textAnchor="middle"
                dominantBaseline="central"
                stroke={outlineColor}
                strokeWidth={4}
                strokeLinejoin="round"
                style={{
                    pointerEvents: 'none',
                    fontSize,
                    fontWeight: 600,
                    opacity: 1,
                }}
            >
                {label}
            </text>
            <text
                textAnchor="middle"
                dominantBaseline="central"
                fill={textColor}
                style={{
                    pointerEvents: 'none',
                    fontSize,
                    fontWeight: 600,
                }}
            >
                {label}
            </text>
        </g>
    )
}

ChartLabel.propTypes = {
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fontSize: PropTypes.number,
    outlineColor: PropTypes.string,
    textColor: PropTypes.string,
}

export default memo(ChartLabel)
