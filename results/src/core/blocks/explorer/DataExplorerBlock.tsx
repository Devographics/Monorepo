import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import DataExplorer from './DataExplorer'
import { ExplorerData } from './types'
// import Selector from './Selector'
import dataExplorerTemplate from '../../../templates/data_explorer.yml'
import { usePageContext } from 'core/helpers/pageContext'
import { getFacetPath, getQuery, runQuery } from './data'

const DataExplorerBlock = ({ data: defaultData }: { data: ExplorerData }) => {
    const context = usePageContext()
    const [data, setData] = useState(defaultData)
    const [xSection, setxSection] = useState('demographics')
    const [xField, setxField] = useState('yearly_salary')
    const [ySection, setySection] = useState('demographics')
    const [yField, setyField] = useState('years_of_experience')
    const stateStuff = {
        xSection,
        setxSection,
        xField,
        setxField,
        ySection,
        setySection,
        yField,
        setyField
    }
    useEffect(() => {
        const getData = async () => {
            const surveyType = context.config.slug
            const facet1 = getFacetPath(xSection, xField)
            const facet2 = getFacetPath(ySection, yField)
            const query = getQuery(dataExplorerTemplate.query, { surveyType, facet1, facet2 })
            // console.log(query)
            const url = process.env.GATSBY_DATA_API_URL
            if (!url) {
                throw new Error('GATSBY_DATA_API_URL env variable is not set')
            }
            const result = await runQuery(url, query, 'ExplorerQuery')
            console.log(result)
            setData(result.survey.explorer)
        }
        getData()
    }, [xSection, xField, ySection, yField])

    return (
        <Wrapper>
            <DataExplorer data={data} stateStuff={stateStuff} />
        </Wrapper>
    )
}

const Wrapper = styled.div``

export default DataExplorerBlock
