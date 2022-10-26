import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import DataExplorer from './DataExplorer'
import BlockData from 'core/blocks/block/BlockData'
import { ExplorerData } from './types'
// import Selector from './Selector'
import dataExplorerTemplate from '../../../templates/data_explorer.yml'
import { usePageContext } from 'core/helpers/pageContext'
import { getFacetPath, getFacetSegments, getQuery, runQuery } from './data'
import { BlockDefinition } from 'core/types'
import last from 'lodash/last'

const DataExplorerBlock = ({
    block,
    data: defaultData
}: {
    block: BlockDefinition
    data: ExplorerData
}) => {
    const context = usePageContext()
    const surveyType = context.config.slug

    const defaultFacet1 = block?.variables?.facet1
    const segments1 = getFacetSegments(defaultFacet1)
    const defaultFacet2 = block?.variables?.facet2
    const segments2 = getFacetSegments(defaultFacet2)
    const defaultQuery = getQuery(dataExplorerTemplate.query, {
        surveyType,
        facet1: defaultFacet1,
        facet2: defaultFacet2
    })
    const lastYear = last(defaultData?.all_years)?.year

    const [data, setData] = useState(defaultData)
    const [xSection, setxSection] = useState(segments1.sectionName)
    const [xField, setxField] = useState(segments1.fieldName)
    const [ySection, setySection] = useState(segments2.sectionName)
    const [yField, setyField] = useState(segments2.fieldName)
    const [query, setQuery] = useState(defaultQuery)
    const [isLoading, setIsLoading] = useState(false)
    const [currentYear, setCurrentYear] = useState(lastYear)

    const stateStuff = {
        xSection,
        setxSection,
        xField,
        setxField,
        ySection,
        setySection,
        yField,
        setyField,
        isLoading,
        setIsLoading,
        currentYear,
        setCurrentYear,
        data,
        setData,
        lastYear // not really state but who cares…
    }

    const initialLoad = useRef(true)
    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false
            return
        }

        const getData = async () => {
            setIsLoading(true)
            const facet1 = getFacetPath(xSection, xField)
            const facet2 = getFacetPath(ySection, yField)
            const query = getQuery(dataExplorerTemplate.query, { surveyType, facet1, facet2 })
            setQuery(query)
            const url = process.env.GATSBY_DATA_API_URL
            if (!url) {
                throw new Error('GATSBY_DATA_API_URL env variable is not set')
            }
            const result = await runQuery(url, query, 'ExplorerQuery')
            setData(result.survey.explorer)
            setIsLoading(false)
        }

        if (xField && yField) {
            getData()
        }
    }, [xField, yField])

    return (
        <Wrapper>
            <DataExplorer data={data} stateStuff={stateStuff} />
            <BlockData block={{ id: `${xField}__${yField}`, query }} data={data} />
        </Wrapper>
    )
}

const Wrapper = styled.div``

export default DataExplorerBlock
