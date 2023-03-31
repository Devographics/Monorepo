import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
import DataExplorer from './DataExplorer'
import { ExplorerData } from './types'
// import Selector from './Selector'
import dataExplorerTemplate from '../../templates/data_explorer.yml'
import { usePageContext } from 'core/helpers/pageContext'
import { getFacetPath, getFacetSegments, getQuery, runQuery, formatData } from './data'
import { BlockDefinition } from '@types/index'
import last from 'lodash/last'
import BlockSponsor from 'core/blocks/block/sponsor_chart/BlockSponsor'
import {
    MOBILE_BREAKPOINT_WIDTH,
    ISSUES_URL,
    RESPONDENTS_PER_DOT,
    PERCENTS_PER_DOT,
    MAX_DOT_PER_CELL_LINE,
    SUPPORT_MULTIPLE_YEARS,
    SHOW_CELL_COUNTS,
    PERCENTAGE_UNIT
} from './constants'
import HintBlock from 'core/blocks/other/HintBlock'
import { useLocation } from '@reach/router'
import { getQuestionLabel } from './labels'
import { useI18n } from 'core/i18n/i18nContext'
import { useWindowDimensions } from './helpers'

const DataExplorerBlock = ({
    block,
    data: defaultData,
    pageData
}: {
    block: BlockDefinition
    data: ExplorerData
    pageData: any
}) => {
    const { getString } = useI18n()
    const { width } = useWindowDimensions()

    const location = useLocation()
    const context = usePageContext()
    const surveyType = context.currentSurvey.slug
    const surveyYear = context.currentEdition.year
    const entities = [].concat(pageData?.internalAPI?.features, pageData?.internalAPI?.tools)

    const search = new URLSearchParams(location.search)
    const queryParams = Object.fromEntries(search.entries())

    const formattedData = formatData(defaultData)
    const lastYear = last(formattedData.all_years)?.year

    const defaultFacet1 = block?.variables?.facet1
    const segments1 = getFacetSegments(defaultFacet1)
    const defaultFacet2 = block?.variables?.facet2
    const segments2 = getFacetSegments(defaultFacet2)
    const defaultXSection = segments1.sectionName
    const defaultXField = segments1.fieldName
    const defaultYSection = segments2.sectionName
    const defaultYField = segments2.fieldName
    const defaultQuery = getQuery(dataExplorerTemplate.query, {
        surveyType,
        facet1: defaultFacet1,
        facet2: defaultFacet2,
        currentYear: surveyYear
    })

    const [data, setData] = useState(formattedData)
    const [xSection, setxSection] = useState(queryParams.xSection || defaultXSection)
    const [xField, setxField] = useState(queryParams.xField || defaultXField)
    const [ySection, setySection] = useState(queryParams.ySection || defaultYSection)
    const [yField, setyField] = useState(queryParams.yField || defaultYField)
    const [query, setQuery] = useState(defaultQuery)
    const [isLoading, setIsLoading] = useState(false)
    const [currentYear, setCurrentYear] = useState(lastYear)
    const [unit, setUnit] = useState(queryParams.unit || PERCENTAGE_UNIT)
    const [respondentsPerDot, setRespondentsPerDot] = useState(
        Number(queryParams.respondentsPerDot) || RESPONDENTS_PER_DOT
    )
    const [percentsPerDot, setPercentsPerDot] = useState(
        Number(queryParams.percentsPerDot) || PERCENTS_PER_DOT
    )
    const [dotsPerLine, setDotsPerLine] = useState(
        Number(queryParams.dotsPerLine) || MAX_DOT_PER_CELL_LINE
    )
    const [showCellCounts, setShowCellCounts] = useState(
        (queryParams.showCellCounts === 'true' ? true : false) || SHOW_CELL_COUNTS
    )

    const xAxisLabel = getQuestionLabel({
        getString,
        sectionId: xSection,
        questionId: xField,
        entities
    })
    const yAxisLabel = getQuestionLabel({
        getString,
        sectionId: ySection,
        questionId: yField,
        entities
    })

    const useMobileLayout = typeof width !== 'undefined' && width <= MOBILE_BREAKPOINT_WIDTH

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
        unit,
        setUnit,
        respondentsPerDot,
        setRespondentsPerDot,
        percentsPerDot,
        setPercentsPerDot,
        dotsPerLine,
        setDotsPerLine,
        showCellCounts,
        setShowCellCounts,
        // other stuff
        useMobileLayout,
        xAxisLabel,
        yAxisLabel,
        lastYear
    }

    useEffect(() => {
        if (useMobileLayout) {
            console.log('// Using mobile layout')
            setRespondentsPerDot(10)
            setPercentsPerDot(5)
            setDotsPerLine(5)
        }
    }, [useMobileLayout])
    /*

    Update URL query parameters when state changes

    */
    const urlVariables = {
        xField,
        yField,
        xSection,
        ySection,
        unit,
        respondentsPerDot,
        percentsPerDot,
        dotsPerLine,
        showCellCounts
    }
    useEffect(() => {
        if (typeof window !== 'undefined' && 'URLSearchParams' in window) {
            const searchParams = new URLSearchParams(window.location.search)
            for (const urlVariableName of Object.keys(urlVariables)) {
                searchParams.set(urlVariableName, urlVariables[urlVariableName])
            }
            const newUrl =
                window.location.protocol +
                '//' +
                window.location.host +
                window.location.pathname +
                '?' +
                searchParams.toString()
            console.log(newUrl)
            window.history.pushState(urlVariables, '', newUrl)

            // window.location.search = searchParams.toString();
        }
    }, Object.values(urlVariables))

    const initialLoad = useRef(true)
    useEffect(() => {
        if (initialLoad.current && xField === defaultXField && yField === defaultYField) {
            initialLoad.current = false
            return
        }

        const getData = async () => {
            setIsLoading(true)
            const facet1 = getFacetPath(xSection, xField)
            const facet2 = getFacetPath(ySection, yField)
            const query = getQuery(dataExplorerTemplate.query, {
                surveyType,
                facet1,
                facet2,
                currentYear: surveyYear
            })
            setQuery(query)
            const url = process.env.GATSBY_DATA_API_URL
            if (!url) {
                throw new Error('GATSBY_DATA_API_URL env variable is not set')
            }
            const result = await runQuery(url, query, 'ExplorerQuery')
            const formattedData = formatData(result.survey.explorer)
            setData(formattedData)
            setIsLoading(false)
        }

        if (xField && yField) {
            getData()
        }
    }, [xField, yField])

    return (
        <Wrapper_>
            <HintBlock block={{ id: 'data_explorer', variables: { issueLink: ISSUES_URL } }} />
            <DataExplorer query={query} data={data} stateStuff={stateStuff} entities={entities} />
            <Details_>
                <T k="explorer.extra_missing_respondents" html={true} md={true} />
            </Details_>
            {/* <BlockSponsor block={block} /> */}
        </Wrapper_>
    )
}

const Wrapper_ = styled.div``

const Details_ = styled.div`
    margin-top: ${spacing(2)};
`

export default DataExplorerBlock
