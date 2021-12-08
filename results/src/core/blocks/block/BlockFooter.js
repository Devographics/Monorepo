import React from 'react'
import styled from 'styled-components'
import { spacing, fontSize } from 'core/theme'
import { useI18n } from 'core/i18n/i18nContext'
import T from 'core/i18n/T'
import BlockUnitsSelector from 'core/blocks/block/BlockUnitsSelector'
import { usePageContext } from 'core/helpers/pageContext'

const Footer = styled.div`
    margin-top: ${spacing()};
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

const BlockFooter = ({ completion, units, setUnits }) => {

    const context = usePageContext()
    const { isCapturing } = context
    return (
    <Footer>
        {completion && (
            <Respondents>
                <T
                    k="chart_units.respondents"
                    values={{
                        count: completion?.count,
                        percentage: completion?.percentage_survey
                    }}
                />
            </Respondents>
        )}
        {setUnits && !isCapturing && (
            <Units>
                <BlockUnitsSelector units={units} onChange={setUnits} />
            </Units>
        )}
    </Footer>
)}

export default BlockFooter
