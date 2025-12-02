import Tooltip from 'core/components/Tooltip'
import './AdvancedOptions.scss'
import React from 'react'
import { QuestionIcon } from '@devographics/icons'
import T from 'core/i18n/T'
import { CustomizationOptions, FilterItem, PanelState } from './types'
import cloneDeep from 'lodash/cloneDeep.js'

export const AdvancedOptions = ({
    allFilters,
    stateStuff
}: {
    allFilters: FilterItem[]
    stateStuff: PanelState
}) => {
    const { filtersState, setFiltersState } = stateStuff

    const getParameter = <T,>(id: string) =>
        filtersState.options[id as keyof CustomizationOptions] as T

    const updateParameter = (id: string, value: any) => {
        setFiltersState(fState => {
            const newState = cloneDeep(fState)
            newState.options[id as keyof CustomizationOptions] = value
            return newState
        })
    }

    return (
        <div className="filters-advanced-options">
            <div className="filters-parameters">
                <CustomParameter id="cutoff">
                    <>
                        <input
                            type="text"
                            value={getParameter<CustomizationOptions['cutoff']>('cutoff')}
                            onChange={e => {
                                updateParameter('cutoff', Number(e.target.value))
                            }}
                        />
                        <select
                            onChange={e => {
                                updateParameter('cutoffType', e.target.value)
                            }}
                            value={getParameter<CustomizationOptions['cutoffType']>('cutoffType')}
                        >
                            <option value="count">
                                <T k="chart_units.count" />
                            </option>
                            <option value="percent">
                                <T k="chart_units.percentage" />
                            </option>
                        </select>
                    </>
                </CustomParameter>
                <CustomParameter id="limit">
                    <input
                        type="text"
                        value={getParameter<CustomizationOptions['limit']>('limit')}
                        onChange={e => {
                            updateParameter('limit', Number(e.target.value))
                        }}
                    />
                </CustomParameter>
                <BooleanParameter
                    id="showDefaultSeries"
                    getParameter={getParameter}
                    updateParameter={updateParameter}
                />
                {/* <BooleanParameter id="mergeOtherBuckets" />
            <BooleanParameter id="showNoAnswer" />
            <BooleanParameter id="showNoMatch" /> */}
            </div>
        </div>
    )
}

const BooleanParameter = ({
    id,
    getParameter,
    updateParameter
}: {
    id: string
    getParameter: <T>(id: string) => T
    updateParameter: (id: string, value: any) => void
}) => {
    const value = !!getParameter<boolean>(id)
    return (
        <label className="filters-parameter">
            <ParameterLabel id={id} />
            <div className="filters-parameter-input">
                <input
                    checked={value}
                    type="checkbox"
                    onChange={e => {
                        updateParameter(id, !value)
                    }}
                />
            </div>
        </label>
    )
}

const CustomParameter = ({ id, children }: { id: string; children: JSX.Element }) => (
    <label className="filters-parameter">
        <ParameterLabel id={id} />
        <div className="filters-parameter-input">{children}</div>
    </label>
)

const ParameterLabel = ({ id }: { id: string }) => (
    <Tooltip
        trigger={
            <span className="filters-parameter-label">
                <T k={`filters.options.${id}`} />
                <QuestionIcon size="petite" />
            </span>
        }
        contents={<T k={`filters.options.${id}.description`} />}
    />
)
