import React, { memo } from 'react'
import { useTheme } from 'styled-components'

const HorizontalBarStripes = (props: {
    bars: Array<any>
    width?: any
    yScale?: any
    role?: string
}) => {
    const { bars, width, yScale, role } = props
    const theme = useTheme()

    const rows: string[] = []
    const step = yScale.step()

    return bars.map((bar, i) => {
        const rowId = bar?.data?.indexValue
        if (!rows.includes(rowId)) {
            rows.push(rowId)
            if (rows.length % 2 !== 0) return null

            return (
                <rect
                    role={role}
                    key={bar.key}
                    y={bar.y + bar.height / 2 - step / 2}
                    width={width}
                    height={step}
                    fill={theme.colors.backgroundAlt}
                />
            )
        }
    })
}

export default memo(HorizontalBarStripes)
