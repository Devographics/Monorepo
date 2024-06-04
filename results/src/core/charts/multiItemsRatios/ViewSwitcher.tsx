import React from 'react'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { Modes, MultiRatiosChartState, Ratios } from './types'
import Tooltip from 'core/components/Tooltip'

const ViewSwitcher = ({ chartState }: { chartState: MultiRatiosChartState }) => {
    const { view, setView, mode, setMode } = chartState
    return (
        <div className="chart-multi-ratios-switcher">
            <div className="multiexp-control multiexp-control-grouping">
                <h4 className="chart-legend-heading">
                    <T k="charts.mode" />
                </h4>
                <ButtonGroup>
                    {Object.values(Modes).map(modeId => {
                        const isChecked = mode === modeId
                        return (
                            <Tooltip
                                key={modeId}
                                trigger={
                                    <Button
                                        size="small"
                                        className={`Button--${
                                            isChecked ? 'selected' : 'unselected'
                                        }`}
                                        onClick={() => {
                                            setMode(modeId)
                                            // setSort(sortOptions[id][0])
                                        }}
                                        aria-pressed={isChecked}
                                    >
                                        <T k={`modes.${modeId}`} />
                                    </Button>
                                }
                                contents={<T k={`modes.${modeId}.description`} md={true} />}
                            />
                        )
                    })}
                </ButtonGroup>
            </div>
            <div className="multiexp-control multiexp-control-grouping">
                <h4 className="chart-legend-heading">
                    <T k="charts.view" />
                </h4>
                <ButtonGroup>
                    {Object.values(Ratios).map(ratioId => {
                        const isChecked = view === ratioId
                        return (
                            <Tooltip
                                key={ratioId}
                                trigger={
                                    <Button
                                        size="small"
                                        className={`Button--${
                                            isChecked ? 'selected' : 'unselected'
                                        }`}
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
        </div>
    )
}

export default ViewSwitcher
