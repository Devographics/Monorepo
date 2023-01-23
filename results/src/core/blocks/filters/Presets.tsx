import React, { useState } from 'react'
import styled from 'styled-components'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import cloneDeep from 'lodash/cloneDeep.js'

const presetsArray = [
    {
        name: 'previous_years',
        options: {
            showDefaultSeries: false
        },
        filters: [
            {
                year: 2020,
                conditions: []
            },
            {
                year: 2021,
                conditions: []
            },
            {
                year: 2022,
                conditions: []
            }
        ]
    },
    {
        name: 'gender',
        options: {
            showDefaultSeries: false
        },
        filters: [
            {
                year: 2022,
                conditions: [
                    {
                        field: 'gender',
                        operator: 'eq',
                        value: 'male'
                    }
                ]
            },
            {
                year: 2022,
                conditions: [
                    {
                        field: 'gender',
                        operator: 'eq',
                        value: 'female'
                    }
                ]
            },
            {
                year: 2022,
                conditions: [
                    {
                        field: 'gender',
                        operator: 'eq',
                        value: 'non_binary'
                    }
                ]
            }
        ]
    },
    {
        name: 'top_countries',
        options: {
            showDefaultSeries: false
        },
        filters: [
            {
                year: 2022,
                conditions: [
                    {
                        field: 'country',
                        operator: 'eq',
                        value: 'USA'
                    }
                ]
            },
            {
                year: 2022,
                conditions: [
                    {
                        field: 'country',
                        operator: 'eq',
                        value: 'DEU'
                    }
                ]
            },
            {
                year: 2022,
                conditions: [
                    {
                        field: 'country',
                        operator: 'eq',
                        value: 'FRA'
                    }
                ]
            }
        ]
    },
    {
        name: 'salary_top_bottom',
        options: {
            showDefaultSeries: false,
        },
        filters: [
            {
                year: 2022,
                conditions: [
                    {
                        field: 'yearly_salary',
                        operator: 'in',
                        value: ['range_work_for_free', 'range_0_10', 'range_10_30', 'range_30_50']
                    }
                ]
            },
            {
                year: 2022,
                conditions: [
                    {
                        field: 'yearly_salary',
                        operator: 'in',
                        value: ['range_50_100', 'range_100_200', 'range_more_than_200']
                    }
                ]
            }
        ]
    }
]

const Presets = ({ setFiltersState }) => (
    <Presets_>
        <Label_>
            <T k="filters.presets.title" />
        </Label_>
        {presetsArray.map(preset => (
            <Preset key={preset.name} preset={preset} setFiltersState={setFiltersState} />
        ))}
    </Presets_>
)

const Preset = ({ preset, setFiltersState }) => (
    <Preset_
        size="small"
        onClick={() => {
            setFiltersState(fState => {
                return {
                    options: { ...fState.options, ...preset.options },
                    filters: preset.filters
                }
            })
        }}
    >
        <T k={`filters.presets.${preset.name}`} />
    </Preset_>
)

const Presets_ = styled.div`
    display: flex;
    gap: ${spacing()};
`

const Label_ = styled.div``

const Preset_ = styled(Button)`
    border-radius: 20px;
`

export default Presets
