import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { spacing } from 'core/theme'
import T from 'core/i18n/T'
import DataExplorer from './DataExplorer'
import { AllQuestionData, ExplorerData } from '@devographics/types'
// import Selector from './Selector'
import { usePageContext } from 'core/helpers/pageContext'
import { getAxisString, getAxisSegments, runQuery } from './data'
import { BlockVariantDefinition } from 'core/types/index'
import last from 'lodash/last'
import {
    MOBILE_BREAKPOINT_WIDTH,
    ISSUES_URL,
    RESPONDENTS_PER_DOT,
    PERCENTS_PER_DOT,
    MAX_DOT_PER_CELL_LINE,
    SHOW_CELL_COUNTS,
    SHOW_NO_ANSWER,
    PERCENTAGE_UNIT
} from './constants'
import HintBlock from 'core/blocks/other/HintBlock'
import { useLocation } from '@reach/router'
import { useI18n } from '@devographics/react-i18n'
import { useWindowDimensions } from './helpers'
import { useEntities } from 'core/helpers/entities'
import { getBlockQuery } from 'core/queries/queries'
import { getFieldLabel } from 'core/filters/helpers'
import { useAllFilters } from 'core/charts/hooks'
import { FilterItem } from 'core/filters/types'
import { BlockDescriptionContents } from 'core/blocks/block/BlockChart'

const DataExplorerBlock = ({
    block,
    data: defaultData
}: {
    block: BlockVariantDefinition
    data: ExplorerData
}) => {
    // console.log(block)
    // console.log(defaultData)

    const allFilters = useAllFilters()

    const { getString } = useI18n()
    const { width } = useWindowDimensions()

    const location = useLocation()
    const pageContext = usePageContext()

    const entities = useEntities()

    const search = new URLSearchParams(location.search)
    const queryParams = Object.fromEntries(search.entries())

    const lastYear = last(defaultData.items)?.year

    const defaultXAxis = block?.variables?.xAxis
    const xSegments = getAxisSegments(defaultXAxis)
    const defaultYAxis = block?.variables?.yAxis
    const ySegments = getAxisSegments(defaultYAxis)
    const defaultXSection = xSegments.sectionId
    const defaultXField = xSegments.questionId
    const defaultYSection = ySegments.sectionId
    const defaultYField = ySegments.questionId

    const { currentSurvey, currentEdition, id: pageId } = pageContext

    const defaultQuery = getBlockQuery({
        block,
        survey: currentSurvey,
        edition: currentEdition,
        section: { id: pageId },
        queryArgs: { xAxis: defaultXAxis, yAxis: defaultYAxis, parameters: { showNoAnswer: true } }
    })

    const [data, setData] = useState(defaultData)
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
    const [showNoAnswer, setShowNoAnswer] = useState(
        (queryParams.showNoAnswer === 'true' ? true : false) || SHOW_NO_ANSWER
    )

    const xAxisLabel = getFieldLabel({
        getString,
        field: allFilters.find(f => f.id === xField) as FilterItem,
        entities
    })
    const yAxisLabel = getFieldLabel({
        getString,
        field: allFilters.find(f => f.id === yField) as FilterItem,
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
        showNoAnswer,
        setShowNoAnswer,
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
        showCellCounts,
        showNoAnswer
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
            const xAxis = getAxisString(xSection, xField)
            const yAxis = getAxisString(ySection, yField)

            const query = getBlockQuery({
                block,
                survey: currentSurvey,
                edition: currentEdition,
                section: { id: pageId },
                queryArgs: { xAxis, yAxis, parameters: { showNoAnswer: true } }
            })
            // console.log('// query')
            // console.log(query)
            setQuery(query)
            const url = process.env.GATSBY_API_URL
            if (!url) {
                throw new Error('GATSBY_API_URL env variable is not set')
            }
            const { result, error } = await runQuery<AllQuestionData>(url, query, 'ExplorerQuery')
            // console.log('// result')
            // console.log(result)

            const { id: sectionId, currentSurvey, currentEdition } = pageContext
            const { id: surveyId } = currentSurvey
            const { id: editionId } = currentEdition

            const data = result.surveys[surveyId][editionId][sectionId].data_explorer

            console.log(data)

            setData(data)
            setIsLoading(false)
        }

        if (xField && yField) {
            getData()
        }
    }, [xField, yField, currentSurvey, currentEdition, pageId])

    return (
        <Wrapper_>
            {/* <HintBlock block={{ id: 'data_explorer', variables: { issueLink: ISSUES_URL } }} /> */}
            <Description_>
                <BlockDescriptionContents block={block} />
            </Description_>
            <DataExplorer query={query} data={data} stateStuff={stateStuff} entities={entities} />
            <Details_>
                <T k="explorer.extra_missing_respondents" html={true} md={true} />
            </Details_>
            {/* <BlockSponsor block={block} /> */}
        </Wrapper_>
    )
}

const Wrapper_ = styled.div``

const Description_ = styled.div`
    margin-top: ${spacing()};
`

const Details_ = styled.div`
    margin-top: ${spacing(2)};
`

export default DataExplorerBlock
