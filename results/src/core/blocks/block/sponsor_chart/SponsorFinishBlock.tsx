import React from 'react'
import T from 'core/i18n/T'
import { ChartId, ChartIdCode } from 'core/blocks/block/sponsor_chart/SponsorPrompt'
import styled from 'styled-components'
import { useLocation } from '@reach/router'

const SponsorFinishBlock = () => {
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    return (
        <div>
            <T k="sponsor.sponsor_finish" md={true} />
            <ChartId2>
                <T k="sponsor.chart_id" /> <ChartIdCode>{params.get('chartId')}</ChartIdCode>
            </ChartId2>
        </div>
    )
}

const ChartId2 = styled(ChartId)`
    text-align: left;
`
export default SponsorFinishBlock
