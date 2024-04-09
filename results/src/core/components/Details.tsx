import T from 'core/i18n/T'
import './Details.scss'
import React, { useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { ChevronDownIcon } from 'core/icons'

export const Details = ({
    labelId,
    defaultOpen = false,
    children
}: {
    labelId: string
    defaultOpen: boolean
    children: JSX.Element
}) => {
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)

    const [showDetails, setShowDetails] = useState(defaultOpen)
    return (
        <div className={`details details-${-showDetails ? 'open' : 'closed'}`} ref={parent}>
            <button
                className="details-trigger"
                onClick={() => {
                    setShowDetails(!showDetails)
                }}
            >
                <h3 className="details-heading">
                    <T k={labelId} />
                </h3>
                <ChevronDownIcon className="details-icon" />
            </button>
            {showDetails && <div className="details-contents">{children}</div>}
        </div>
    )
}
