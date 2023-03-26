import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import cloneDeep from 'lodash/cloneDeep.js'
import { Series_ } from './Series'
import { CustomizationDefinition } from './types'

interface OptionsProps {
    filtersState: CustomizationDefinition
    setFiltersState: React.Dispatch<React.SetStateAction<CustomizationDefinition>>
}

const Options = ({ filtersState, setFiltersState }: OptionsProps) => (
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
