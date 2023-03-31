import React from 'react'
import styled from 'styled-components'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import { DeleteIcon } from 'core/icons'
import { useI18n } from 'core/i18n/i18nContext'
import {
    PanelState,
    PresetDefinition,
    CustomizationOptions,
    CustomizationDefinition,
    OperatorEnum
} from './types'

const getPresetsArray = (options: CustomizationOptions): PresetDefinition[] => {
    const { enableYearSelect } = options
    return [
        ...(enableYearSelect
            ? [
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
                  }
              ]
            : []),
        {
            name: 'gender',
            options: {
                showDefaultSeries: false
            },
            filters: [
                {
                    conditions: [
                        {
                            fieldId: 'gender',
                            sectionId: 'user_info',
                            operator: OperatorEnum['EQ'],
                            value: 'male'
                        }
                    ]
                },
                {
                    conditions: [
                        {
                            fieldId: 'gender',
                            sectionId: 'user_info',
                            operator: OperatorEnum['EQ'],
                            value: 'female'
                        }
                    ]
                },
                {
                    conditions: [
                        {
                            fieldId: 'gender',
                            sectionId: 'user_info',
                            operator: OperatorEnum['EQ'],
                            value: 'non_binary'
                        }
                    ]
                }
            ]
        },
        // {
        //     name: 'top_countries',
        //     options: {
        //         showDefaultSeries: false
        //     },
        //     filters: [
        //         {
        //             year: 2022,
        //             conditions: [
        //                 {
        //                     field: 'country',
        //                     operator: 'eq',
        //                     value: 'USA'
        //                 }
        //             ]
        //         },
        //         {
        //             year: 2022,
        //             conditions: [
        //                 {
        //                     field: 'country',
        //                     operator: 'eq',
        //                     value: 'DEU'
        //                 }
        //             ]
        //         },
        //         {
        //             year: 2022,
        //             conditions: [
        //                 {
        //                     field: 'country',
        //                     operator: 'eq',
        //                     value: 'FRA'
        //                 }
        //             ]
        //         }
        //     ]
        // },
        {
            name: 'salary_low_high',
            options: {
                showDefaultSeries: false
            },
            filters: [
                {
                    conditions: [
                        {
                            fieldId: 'yearly_salary',
                            sectionId: 'user_info',
                            operator: OperatorEnum['IN'],
                            value: [
                                'range_work_for_free',
                                'range_0_10',
                                'range_10_30',
                                'range_30_50'
                            ]
                        }
                    ]
                },
                {
                    conditions: [
                        {
                            fieldId: 'yearly_salary',
                            sectionId: 'user_info',
                            operator: OperatorEnum['IN'],
                            value: ['range_50_100', 'range_100_200', 'range_more_than_200']
                        }
                    ]
                }
            ]
        },
        {
            name: 'experience_low_high',
            options: {
                showDefaultSeries: false
            },
            filters: [
                {
                    conditions: [
                        {
                            fieldId: 'years_of_experience',
                            sectionId: 'user_info',
                            operator: OperatorEnum['IN'],
                            value: ['range_less_than_1', 'range_1_2', 'range_2_5']
                        }
                    ]
                },
                {
                    conditions: [
                        {
                            fieldId: 'years_of_experience',
                            sectionId: 'user_info',
                            operator: OperatorEnum['IN'],
                            value: ['range_5_10', 'range_10_20', 'range_more_than_20']
                        }
                    ]
                }
            ]
        }
    ]
}

interface PresetsProps {
    stateStuff: PanelState
}

const Presets = ({ stateStuff }: PresetsProps) => {
    const { customPresets, setCustomPresets, filtersState, setFiltersState } = stateStuff
    const { getString } = useI18n()

    return (
        <Presets_>
            <Label_>
                <T k="filters.presets.title" />
            </Label_>
            {getPresetsArray(filtersState.options).map(preset => (
                <Preset key={preset.name} preset={preset} setFiltersState={setFiltersState} />
            ))}
            {customPresets.map(preset => (
                <Preset
                    key={preset.name}
                    preset={preset}
                    setFiltersState={setFiltersState}
                    isCustom={true}
                    setCustomPresets={setCustomPresets}
                />
            ))}
            <SavePreset_
                variant="link"
                size="small"
                onClick={() => {
                    const name = window.prompt(getString('filters.presets.enter_name')?.t)
                    if (name) {
                        setCustomPresets(presets => {
                            return [...presets, { ...filtersState, name }]
                        })
                    }
                }}
            >
                <T k="filters.presets.save" />
            </SavePreset_>
        </Presets_>
    )
}

interface PresetProps {
    preset: PresetDefinition
    setCustomPresets?: React.Dispatch<React.SetStateAction<PresetDefinition[]>>
    setFiltersState: React.Dispatch<React.SetStateAction<CustomizationDefinition>>
    isCustom?: boolean
}
const Preset = ({ preset, setCustomPresets, setFiltersState, isCustom }: PresetProps) => {
    const handleDelete = () => {
        setCustomPresets &&
            setCustomPresets(presets => {
                const newPresets = presets.filter(p => p.name !== preset.name)
                return newPresets
            })
    }
    return (
        <PresetWrapper_>
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
                {isCustom ? preset.name : <T k={`filters.presets.${preset.name}`} />}
            </Preset_>
            {isCustom && (
                <DeletePreset_ onClick={handleDelete} size="small">
                    <DeleteIcon labelId="filters.condition.delete" />
                </DeletePreset_>
            )}
        </PresetWrapper_>
    )
}

const Presets_ = styled.div`
    display: flex;
    gap: ${spacing()};
    flex-wrap: wrap;
`

const PresetWrapper_ = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing(0.5)};
`

const Label_ = styled.div``

const Preset_ = styled(Button)`
    border-radius: 20px;
    white-space: nowrap;
`

const SavePreset_ = styled(Button)`
    border-radius: 20px;
    font-size: ${fontSize('small')};
`

const DeletePreset_ = styled(Button)`
    background: none;
    border-color: ${({ theme }) => theme.colors.borderAlt};
    border-radius: 100%;
    aspect-ratio: 1/1;
    padding: 2px;
    height: 24px;
    width: 24px;
    .icon-wrapper,
    svg {
        height: 18px;
        width: 18px;
    }
`
export default Presets
