import React, { memo, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { useI18n } from 'core/i18n/i18nContext'
import T from 'core/i18n/T'
import { useTheme } from 'styled-components'
import GaugeBarChart from 'core/charts/generic/GaugeBarChart'
import take from 'lodash/take'
import { useLegends } from 'core/helpers/useBucketKeys'
import sortBy from 'lodash/sortBy'
import reverse from 'lodash/reverse'
import styled from 'styled-components'
import { fontSize, spacing } from 'core/theme'
import { getCountryName } from 'core/helpers/countries'
import { getTableData } from 'core/helpers/datatables'

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

const ByFacetBlock = ({ block, data, keys }) => {
    const {
        id,
        mode = 'relative',
        defaultUnits = 'percentage_facet',
        translateData = true,
        colorVariant,
        variables
    } = block

    const { translate } = useI18n()

    const { fieldId, facetId, options = {} } = variables
    const { facetSort = {} } = options
    const { property = 'mean', order = '___desc___' } = facetSort

    const units = defaultUnits

    const globalFacet = data[`${fieldId}_all_${facetId}`]?.year?.facets[0]
    const facetFacets = data[`${fieldId}_by_${facetId}`]?.year?.facets.filter(f => f.id !== null)
    const allFacets = [globalFacet, ...facetFacets]
    let sortedFacets = sortBy(allFacets, f => f[property])

    if (order === '___desc___') {
        sortedFacets.reverse()
    }

    const theme = useTheme()

    const bucketKeys = useLegends(block, keys, fieldId)
    const colorRange = theme.colors.ranges[fieldId] ?? {}
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
                        keys.forEach(key => {
                            const bucket = facet.buckets.find(b => b.id === key)
                            if (bucket) {
                                // note: some buckets might not contain all keys
                                rowData[key] = bucket[units]
                            }
                        })
                        return rowData
                    }),
                    valueKeys: keys?.map(k => ({
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
                    keys={keys}
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
                        <FacetName>
                            {getLabel(facetId, facet)}
                        </FacetName>
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
                    units="percentage_facet"
                    buckets={facet.buckets}
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
