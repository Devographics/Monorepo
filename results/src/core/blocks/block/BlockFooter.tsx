import React from 'react'
import styled from 'styled-components'
import { spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
import BlockUnitsSelector from 'core/blocks/block/BlockUnitsSelector'
import { usePageContext } from 'core/helpers/pageContext'

const Footer = styled.div`
    .rawchartmode & {
        display: none;
    }
    margin-bottom: ${spacing()};
`

const Respondents = styled.div`
    font-size: ${fontSize('small')};
    text-align: center;
    color: ${props => props.theme.colors.textAlt};
    margin-bottom: ${spacing(0.5)};
`

const Units = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`

const BlockFooter = ({ unitsOptions, completion, units, setUnits, chartFilters }) => {
    const context = usePageContext()
    const { isCapturing } = context
    return (
        <Footer>
            {completion && (
                <Respondents>
                    <T
                        k="chart_units.respondents"
                        values={{
                            total: completion.total,
                            count: completion?.count,
                            percentage: completion?.percentageSurvey
                        }}
                        md={true}
                        html={true}
                    />
                </Respondents>
            )}
            {setUnits && !isCapturing && (
                <Units>
                    <BlockUnitsSelector
                        units={units}
                        onChange={setUnits}
                        options={unitsOptions}
                        chartFilters={chartFilters}
                    />
                </Units>
            )}
        </Footer>
    )
}

export default BlockFooter
