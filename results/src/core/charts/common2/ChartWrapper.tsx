import React from 'react'
import './ChartWrapper.scss'
import { useAutoAnimate } from '@formkit/auto-animate/react'

export const ChartWrapper = ({
    children,
    className = ''
}: {
    children: JSX.Element
    className?: string
}) => {
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)

    return (
        <div className={`chart-wrapper ${className}`} ref={parent}>
            {children}
        </div>
    )
}

export default ChartWrapper
