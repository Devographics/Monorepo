import T from 'core/i18n/T'
import './Details.scss'
import React, { useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'

export const Details = ({ labelId, children }: { labelId: string; children: JSX.Element }) => {
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)

    const [showDetails, setShowDetails] = useState(false)
    return (
        <div className="details" ref={parent}>
            <h3>
                <button
                    onClick={() => {
                        setShowDetails(!showDetails)
                    }}
                >
                    <T k={labelId} />
                </button>
            </h3>
            {showDetails && <div className="details-contents">{children}</div>}
        </div>
    )
}
