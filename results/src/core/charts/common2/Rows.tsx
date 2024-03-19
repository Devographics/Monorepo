import React from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'

export const Rows = ({ children }: { children: React.ReactNode }) => {
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)
    return (
        <div className="chart-rows" ref={parent}>
            {children}
        </div>
    )
}

export default Rows
