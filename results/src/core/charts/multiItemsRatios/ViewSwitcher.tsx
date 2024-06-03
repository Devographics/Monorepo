import React from 'react'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { MultiRatiosChartState, Ratios } from './types'
import Tooltip from 'core/components/Tooltip'

const ViewSwitcher = ({ chartState }: { chartState: MultiRatiosChartState }) => {
    const { view, setView } = chartState
    return (
        <div className="chart-multi-ratios-switcher">
            <ButtonGroup>
                {Object.values(Ratios).map(ratioId => {
                    const isChecked = view === ratioId
                    return (
                        <Tooltip
                            key={ratioId}
                            trigger={
                                <Button
                                    size="small"
                                    className={`Button--${isChecked ? 'selected' : 'unselected'}`}
                                    onClick={() => {
                                        setView(ratioId)
                                        // setSort(sortOptions[id][0])
                                    }}
                                    aria-pressed={isChecked}
                                >
                                    <T k={`ratios.${ratioId}`} />
                                </Button>
                            }
                            contents={<T k={`ratios.${ratioId}.description`} md={true} />}
                        />
                    )
                })}
            </ButtonGroup>
        </div>
    )
}

export default ViewSwitcher
