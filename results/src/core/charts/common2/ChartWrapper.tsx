import React from 'react'
import './ChartWrapper.scss'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { ROW_HEIGHT } from './Row'

export const ChartWrapper = ({
    children,
    className = ''
}: {
    children: JSX.Element
    className?: string
}) => {
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)
    const style = {
        '--rowHeight': `${ROW_HEIGHT}px`
    }
    return (
        <div className={`chart-wrapper ${className}`} ref={parent} style={style}>
            {children}
        </div>
    )
}

export default ChartWrapper
