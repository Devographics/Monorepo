import React, { useMemo, useState } from 'react'
import { range, maxBy } from 'lodash'
// @ts-ignore
import Block from 'core/blocks/block/BlockVariant'
import { BlockContext } from 'core/blocks/types'
import { ToolsCardinalityByUserBucket } from '@types/survey_api/tools'
// @ts-ignore
import variables from 'Config/variables.yml'
import { AllSectionsToolsCardinalityByUserChart } from './AllSectionsToolsCardinalityByUserChart'
import { getTableData } from 'core/helpers/datatables'
import { useI18n } from '@devographics/react-i18n'

const { toolsCategories } = variables

interface AllSectionsToolsCardinalityByUserBlockProps {
    block: BlockContext<
        'sectionToolsCardinalityByUserTemplate',
        'SectionToolsCardinalityByUserBlock'
    >
    data: Record<string, ToolsCardinalityByUserBucket[]>
    units?: 'percentageSurvey' | 'count'
}

const getChartData = (data: AllSectionsToolsCardinalityByUserBlockProps['data']) => {
    // As GraphQL queries get merged for a page, you can get
    // unwanted props, so we cannot just use object keys for
    // the data itself, hence the use of `toolsCategories`.
    return Object.entries<string[]>(toolsCategories).map(([sectionId, toolIds]) => {
        if (sectionId in data) {
            const sectionBuckets = data[sectionId]

            const normalizedBuckets = range(toolIds.length, 0).map(cardinality => {
                const matchingBucket = sectionBuckets.find(
                    bucket => bucket.cardinality === cardinality
                )
                if (matchingBucket) {
                    return matchingBucket
                }

                return {
                    cardinality,
                    count: 0,
                    percentageSurvey: 0
                }
            })

            return {
                sectionId,
                data: normalizedBuckets
            }
        } else {
            return {
                sectionId,
                data: []
            }
        }
    }) as {
        sectionId: string
        data: ToolsCardinalityByUserBucket[]
    }[]
}

export const AllSectionsToolsCardinalityByUserBlock = ({
    block,
    data,
    defaultUnits = 'percentageSurvey'
}: AllSectionsToolsCardinalityByUserBlockProps) => {
    // const [units, setUnits] = useState(defaultUnits)
    const units = defaultUnits
    const { getString } = useI18n()

    const chartData = useMemo(() => getChartData(data), [data])

    const maxNumberOfTools = maxBy<string[]>(Object.values(toolsCategories), 'length')!.length

    return (
        <Block
            units={units}
            // setUnits={setUnits}
            block={{
                ...block,
                blockName: 'all_sections_tools_cardinality_by_user'
            }}
            tables={chartData.map(({ sectionId, data }) =>
                getTableData({
                    title: getString(`sections.${sectionId}.title`)?.t,
                    data: data.map(item => ({ ...item, label: item.cardinality })).reverse(),
                    valueKeys: ['count', 'percentageSurvey']
                })
            )}
            data={data}
        >
            <AllSectionsToolsCardinalityByUserChart
                data={chartData}
                units={units}
                maxNumberOfTools={maxNumberOfTools}
            />
        </Block>
    )
}
