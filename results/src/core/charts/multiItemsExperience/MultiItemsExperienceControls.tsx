import React from 'react'
import './MultiItemsExperience.scss'
import { ChartState, GroupingOptions, OrderOptions, sortOptions } from './types'

export const MultiItemsExperienceControls = ({ chartState }: { chartState: ChartState }) => {
    const { grouping, setGrouping, sort, setSort, order, setOrder } = chartState
    return (
        <>
            <div className="multiexp-controls multiexp-controls-grouping">
                <h4>Group by:</h4>
                {Object.values(GroupingOptions).map(id => (
                    <Radio
                        key={id}
                        id={id}
                        isChecked={grouping === id}
                        handleChange={() => {
                            setGrouping(id)
                            setSort(sortOptions[id][0])
                        }}
                    />
                ))}
            </div>

            <div className="multiexp-controls multiexp-controls-sort">
                <h4>Sort by:</h4>
                {sortOptions[grouping].map(option => (
                    <Radio
                        key={option}
                        id={option}
                        isChecked={sort === option}
                        handleChange={() => setSort(option)}
                    />
                ))}
            </div>

            <div className="multiexp-controls multiexp-controls-order">
                <h4>Order by:</h4>
                {Object.values(OrderOptions).map(option => (
                    <Radio
                        key={option}
                        id={option}
                        isChecked={order === option}
                        handleChange={() => setOrder(option)}
                    />
                ))}
            </div>
        </>
    )
}

const Radio = ({
    id,
    isChecked,
    handleChange
}: {
    id: string
    isChecked: boolean
    handleChange: () => void
}) => {
    return (
        <label htmlFor={id} className={`radio ${isChecked ? 'radio-checked' : 'radio-unchecked'}`}>
            <input
                type="radio"
                id={id}
                name="grouping"
                value={id}
                checked={isChecked}
                onChange={handleChange}
            />
            {id}
        </label>
    )
}
