import React, { memo, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalStackedBarChart from 'core/charts/generic/HorizontalStackedBarChart'
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


const GenderByCountries = ({ block, data, keys }) => {
    const {
        id,
        mode = 'relative',
        defaultUnits = 'percentage_facet',
        translateData,
        i18nNamespace,
        colorVariant,
    } = block

    const [units, setUnits] = useState(defaultUnits)

    const { translate } = useI18n()

    const globalFacet = data?.all_countries?.year?.facets[0]
    const allCountryFacets = data?.gender_by_countries?.year?.facets
    const significantFacets = allCountryFacets
        .filter((f) => !!f.id)
        .filter((f) => f?.completion?.percentage_question > 1)
    const allFacets = take(
        sortBy([globalFacet, ...significantFacets], (f) => {
            const maleBucket = f.buckets.find((b) => b.id === 'male')
            return maleBucket && maleBucket.percentage_facet
        }),
        11
    )

    const theme = useTheme()

    const bucketKeys = useLegends(block, keys)
    const colorMapping = useMemo(
        () =>
            bucketKeys.map((item) => ({
                ...item,
                color: theme.colors.ranges.gender[item.id],
            })),
        [theme]
    )

    return (
        <Block
            units={units}
            setUnits={setUnits}
            data={data}
            // tables={[
            //     {
            //         headings: [
            //             { id: 'label', label: <T k="table.label" /> },
            //             { id: 'percentage_survey', label: <T k="table.percentage" /> },
            //             { id: 'count', label: <T k="table.count" /> },
            //         ],
            //         rows: data.buckets.map((bucket) => [
            //             {
            //                 id: 'label',
            //                 label: bucket.entity
            //                     ? bucket.entity.name
            //                     : translate(`options.${i18nNamespace || id}.${bucket.id}`),
            //             },
            //             {
            //                 id: 'percentage_survey',
            //                 label: `${bucket.percentage_survey}%`,
            //             },
            //             {
            //                 id: 'count',
            //                 label: bucket.count,
            //             },
            //         ]),
            //     },
            // ]}
            block={block}
        >
            {allFacets.map((facet, i) => (
                <Facet key={facet.id} i={i} facet={facet} colorMapping={colorMapping} />
            ))}
        </Block>
    )
}

const Facet = ({ facet, colorMapping, i }) => (
    <Row>
        <TableHeading>
            {facet.id === 'default' ? (
                <Average>
                    <T k="charts.all_respondents" />
                </Average>
            ) : (
                <div>
                    <CountryName>{getCountryName(facet.id)} </CountryName>
                    <CountryStats>{facet?.completion?.count} responses</CountryStats>
                </div>
            )}
        </TableHeading>
        <ChartContainer height={40} fit={true}>
            <GaugeBarChart
                units="percentage_facet"
                buckets={facet.buckets}
                colorMapping={colorMapping}
                i18nNamespace="options.gender"
            />
        </ChartContainer>
    </Row>
)

const Row = styled.div`
    display: grid;
    grid-template-columns: 150px auto;
    column-gap: ${spacing()};
    margin-bottom: ${spacing(0.5)};
    font-size: ${fontSize('smallish')};
`
const TableHeading = styled.div`
    display: flex;
    align-items: center;
`

const Average = styled.h4`
    margin: 0;
`
const CountryName = styled.h4`
    margin: 0;
`

const CountryStats = styled.div`
    color: ${(props) => props.theme.colors.textAlt};
    font-size: ${fontSize('small')};
`

GenderByCountries.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        dataPath: PropTypes.string.isRequired,
        showDescription: PropTypes.bool,
        translateData: PropTypes.bool,
        mode: PropTypes.oneOf(['absolute', 'relative']),
        defaultUnits: PropTypes.oneOf(['percentage_survey', 'percentage_question', 'count']),
        colorVariant: PropTypes.oneOf(['primary', 'secondary']),
    }).isRequired,
    data: PropTypes.shape({
        buckets: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
            })
        ).isRequired,
    }).isRequired,
}

export default memo(GenderByCountries)
