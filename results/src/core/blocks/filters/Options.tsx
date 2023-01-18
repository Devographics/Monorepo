import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import cloneDeep from 'lodash/cloneDeep.js'
import { Series_ } from './Series'
import { BEHAVIOR_MULTIPLE, BEHAVIOR_COMBINED } from './constants'

const Options = ({ filtersState, setFiltersState }) => (
    <Options_>
        <Option_>
            <label>
                <input
                    checked={filtersState.options.showDefaultSeries}
                    type="checkbox"
                    onChange={e => {
                        setFiltersState(fState => {
                            const newState = cloneDeep(fState)
                            newState.options.showDefaultSeries = !fState.options.showDefaultSeries
                            return newState
                        })
                    }}
                />{' '}
                <T k="filters.series.show_default" />
            </label>
        </Option_>
        {filtersState.options.allowModeSwitch && (
            <Option_>
                <label>
                    <input
                        name="behavior"
                        value={BEHAVIOR_MULTIPLE}
                        checked={filtersState.options.behavior === BEHAVIOR_MULTIPLE}
                        type="radio"
                        onChange={e => {
                            setFiltersState(fState => {
                                const newState = cloneDeep(fState)
                                newState.options.behavior = BEHAVIOR_MULTIPLE
                                return newState
                            })
                        }}
                    />{' '}
                    <T k={`filters.series.behavior_${BEHAVIOR_MULTIPLE}`} />
                </label>
                <label>
                    <input
                        name="behavior"
                        value={BEHAVIOR_COMBINED}
                        checked={filtersState.options.behavior === BEHAVIOR_COMBINED}
                        type="radio"
                        onChange={e => {
                            setFiltersState(fState => {
                                const newState = cloneDeep(fState)
                                newState.options.behavior = BEHAVIOR_COMBINED
                                return newState
                            })
                        }}
                    />{' '}
                    <T k={`filters.series.behavior_${BEHAVIOR_COMBINED}`} />
                </label>
            </Option_>
        )}
    </Options_>
)

export const Options_ = styled(Series_)`
    display: flex;
    align-items: center;
    justify-content: space-between;
`

export const Option_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing(0.5)};
`

export default Options
