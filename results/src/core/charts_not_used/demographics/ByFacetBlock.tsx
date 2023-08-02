import React, { memo, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { useI18n } from 'core/i18n/i18nContext'
import T from 'core/i18n/T'
import { useTheme } from 'styled-components'
import GaugeBarChart from 'core/charts_not_used/generic/GaugeBarChart'
import take from 'lodash/take'
import { useLegends } from 'core/helpers/legends'
import sortBy from 'lodash/sortBy'
import reverse from 'lodash/reverse'
import styled from 'styled-components'
import { fontSize, spacing } from 'core/theme'
import { getTableData } from 'core/helpers/datatables'
import { StandardQuestionData } from '@devographics/types'
import { BlockComponentProps } from 'core/types'
import { useOptions } from 'core/helpers/options'

const getLabel = (facetId, facet) => {
    const { translate } = useI18n()
    if (facetId === 'country') {
        return getCountryName(facet.id)
    } else {
        const fullLabel = translate(`options.${facetId}.${facet.id}`)
        const shortLabel = translate(`options.${facetId}.${facet.id}.short`)
        const label =
            facet.id === 'default' ? translate('charts.all_respondents') : shortLabel ?? fullLabel
        return label
    }
}

interface ByFacetBlockProps extends BlockComponentProps {
    data: StandardQuestionData
}

const ByFacetBlock = ({ block, data }: ByFacetBlockProps) => {
    const {
        id,
        mode = 'relative',
        defaultUnits = 'percentageBucket',
        translateData = true,
        colorVariant,
        facet,
        fieldId,
        parameters
    } = block

    const { translate } = useI18n()

    const { facetSort = {} } = parameters
    const { property = 'mean', order = 'desc' } = facetSort

    const facetId = facet

    const units = defaultUnits

    const globalFacet = {
        id: 'default',
        buckets: data.responses.currentEdition.buckets.map(bucket => {
            const { facetBuckets, ...rest } = bucket
            return rest
        })
    }
    const facetFacets = data.responses.currentEdition.buckets.map(bucket => bucket.facetBuckets)

    // const globalFacet = data[`${fieldId}_all_${facetId}`]?.year?.facets[0]
    // const facetFacets = data[`${fieldId}_by_${facetId}`]?.year?.facets.filter(f => f.id !== null)
    const allFacets = [globalFacet, ...facetFacets]
    let sortedFacets = sortBy(allFacets, f => f[property])

    console.log(block)
    console.log(data)
    console.log(globalFacet)
    console.log(facetFacets)
    console.log(allFacets)

    if (order === 'desc') {
        sortedFacets.reverse()
    }

    const theme = useTheme()

    // facet is going to be "user_info__gender", but we only want to keep "gender"
    const facetFieldId = facet.split('__')[1]
    const chartOptions = useOptions(facetFieldId)

    const bucketKeys = useLegends(block, chartOptions, facetFieldId)
    const colorRange = theme.colors.ranges[facetFieldId] ?? {}
    const colorMapping = useMemo(
        () =>
            bucketKeys.map(item => ({
                ...item,
                color: colorRange[item.id]
            })),
        [theme]
    )

    return (
        <Block
            legends={bucketKeys}
            units={units}
            data={data}
            block={{ ...block, legendPosition: 'top' }}
            tables={[
                getTableData({
                    data: sortedFacets.map(facet => {
                        const label = getLabel(facetId, facet)
                        const rowData = { id: facet.id, displayAsPercentage: true, label }
                        chartOptions.forEach(key => {
                            const bucket = facet.find(b => b.id === key)
                            if (bucket) {
                                // note: some buckets might not contain all keys
                                rowData[key] = bucket[units]
                            }
                        })
                        return rowData
                    }),
                    valueKeys: chartOptions?.map(k => ({
                        id: `${k}`,
                        labelId: `options.${fieldId}.${k}`
                    })),
                    translateData,
                    i18nNamespace: facetId
                })
            ]}
        >
            {sortedFacets.map((facet, i) => (
                <Facet
                    key={facet.id}
                    fieldId={fieldId}
                    i={i}
                    facet={facet}
                    colorMapping={colorMapping}
                    keys={chartOptions}
                    facetId={facetId}
                />
            ))}
        </Block>
    )
}

const Facet = ({ facet, colorMapping, keys, fieldId, facetId }) => {
    const { translate } = useI18n()
    const fullLabel = translate(`options.${facetId}.${facet.id}`)
    const shortLabel = translate(`options.${facetId}.${facet.id}.short`)
    const label = shortLabel ?? fullLabel
    return (
        <Row>
            <TableHeading>
                {facet.id === 'default' ? (
                    <Average>
                        <T k="charts.all_respondents" />
                    </Average>
                ) : (
                    <div>
                        {/* {facet.mean} */}
                        <FacetName>{getLabel(facetId, facet)}</FacetName>
                        <FacetStats>
                            <T
                                k="charts.facet_responses"
                                values={{ count: facet?.completion?.count }}
                            />
                        </FacetStats>
                    </div>
                )}
            </TableHeading>
            <ChartContainer height={40} fit={true}>
                <GaugeBarChart
                    keys={keys}
                    units="percentageBucket"
                    buckets={facet}
                    colorMapping={colorMapping}
                    i18nNamespace={fieldId}
                />
            </ChartContainer>
        </Row>
    )
}

const Row = styled.div`
    display: grid;
    grid-template-columns: 170px auto;
    column-gap: ${spacing()};
    margin-bottom: ${spacing(0.5)};
    font-size: ${fontSize('small')};
`
const TableHeading = styled.div`
    display: flex;
    align-items: center;
`

const Average = styled.h4`
    margin: 0;
`
const FacetName = styled.h4`
    margin: 0;
`

const FacetStats = styled.div`
    color: ${props => props.theme.colors.textAlt};
    font-size: ${fontSize('small')};
`

export default memo(ByFacetBlock)
