import React, { memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import get from 'lodash/get'
import { spacing, fontSize } from 'core/theme'

const HeatmapChartRow = ({
    item,
    keys,
    index,
    backgroundColorScale,
    setCurrent,
    isActive,
    isInactive,
    isEven,
}) => {
    const onMouseEnter = useCallback(() => setCurrent(index), [setCurrent, index])
    const onMouseLeave = useCallback(() => setCurrent(null), [setCurrent])

    return (
        <>
            <LabelCell
                isEven={isEven}
                isActive={isActive}
                isInactive={isInactive}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {get(item, 'entity.name', item.id)}
            </LabelCell>
            {keys.map((keyId) => {
                const cell = item.ranges.find((r) => r.range === keyId)

                return (
                    <ValueCell
                        key={keyId}
                        isActive={isActive}
                        isInactive={isInactive}
                        style={{
                            background: backgroundColorScale((cell && cell.percentage) || 0),
                        }}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                    >
                        {(cell && cell.percentage) || 0}%
                    </ValueCell>
                )
            })}
        </>
    )
}

HeatmapChartRow.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        ranges: PropTypes.arrayOf(
            PropTypes.shape({
                range: PropTypes.string.isRequired,
                count: PropTypes.number.isRequired,
                percentage: PropTypes.number.isRequired,
            })
        ).isRequired,
    }).isRequired,
    keys: PropTypes.arrayOf(PropTypes.string).isRequired,
    index: PropTypes.number.isRequired,
    backgroundColorScale: PropTypes.func.isRequired,
    setCurrent: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired,
    isInactive: PropTypes.bool.isRequired,
    isEven: PropTypes.bool.isRequired,
}

const Cell = styled.div`
    height: 40px;
    display: flex;
    align-items: center;
    transition: opacity 200ms;
    opacity: ${({ isInactive }) => (isInactive ? 0.3 : 1)};
`

const LabelCell = styled(Cell)`
    font-size: ${fontSize('smallish')};
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 ${spacing(0.5)};
    background: ${({ isEven, isActive, theme }) => {
        if (isEven || isActive) return theme.colors.backgroundAlt
        return undefined
    }};
`

const ValueCell = styled(Cell)`
    font-weight: 600;
    color: ${({ theme }) => theme.colors.background};
    font-size: ${fontSize('smaller')};
    justify-content: center;
`

export default memo(HeatmapChartRow)
