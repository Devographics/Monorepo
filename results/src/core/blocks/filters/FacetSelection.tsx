import React from 'react'
import styled from 'styled-components'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import { FiltersTop_, Heading_, Description_, Wrapper_ } from './FiltersSelection'
import { Options_, Option_ } from './Options'
import { useI18n } from 'core/i18n/i18nContext'
import cloneDeep from 'lodash/cloneDeep'
import { useKeys } from './helpers'

// disable facets with too many segments
const disabledFacets = ['source', 'country']

const FacetSelection = ({ chartName, stateStuff }) => {
    const { getString } = useI18n()
    const allChartsKeys = useKeys()
    const { facets } = allChartsKeys
    const { filtersState, setFiltersState } = stateStuff
    const enabledFacets = facets.filter(f => !disabledFacets.includes(f))

    return (
        <Wrapper_>
            <FiltersTop_>
                <Description_>
                    <T k="filters.facets.description" html={true} md={true} />
                </Description_>
            </FiltersTop_>
            <Options_>
                <Option_>
                    <label>
                        <T k="filters.facet" />{' '}
                        <select
                            onChange={e => {
                                const value = e.target.value
                                setFiltersState(fState => {
                                    const newState = cloneDeep(fState)
                                    newState.facet = value
                                    return newState
                                })
                            }}
                            value={filtersState.facet}
                        >
                            <option>{getString('filters.facet.select')?.t}</option>
                            {enabledFacets.map(f => (
                                <option key={f} value={f}>
                                    {getString(`user_info.${f}`)?.t}
                                </option>
                            ))}
                        </select>
                    </label>
                </Option_>
            </Options_>
        </Wrapper_>
    )
}

export default FacetSelection
