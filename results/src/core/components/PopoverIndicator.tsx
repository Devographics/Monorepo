import React from 'react'

const svgs = {
    top: <polygon points="0,50 100,50 50,0" />,
    bottom: <polygon points="0,0 100,0 50,50" />
}

const PopoverIndicator = ({ isOpened }: { isOpened: boolean }) => (
    <svg className="popover-indicator" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
        {isOpened ? svgs['top'] : svgs['bottom']}
    </svg>
)

export default PopoverIndicator
