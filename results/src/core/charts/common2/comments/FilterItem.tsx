import Button from 'core/components/Button'
import React from 'react'

export const KEYWORD_COUNT = 25

export const FilterItem = ({
    id,
    label,
    count,
    clickHandler,
    isActive
}: {
    id: string | number
    label: string
    count: number
    clickHandler: () => void
    isActive: boolean
}) => {
    return (
        <button
            className={`comment-filter-item comment-filter-item-${id} comment-filter-item-${
                isActive ? 'active' : 'inactive'
            }`}
            onClick={e => {
                e.preventDefault()
                clickHandler()
            }}
        >
            {label} ({count})
        </button>
    )
}
