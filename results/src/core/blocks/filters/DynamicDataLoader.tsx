import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { mergeBuckets, getFiltersQuery } from './helpers'
import { runQuery } from 'core/blocks/explorer/data'
import Loading from 'core/blocks/explorer/Loading'

const DynamicDataLoader = ({ block, completion, defaultBuckets, children, series, setBuckets }) => {
    const [isLoading, setIsLoading] = useState(false)

    const initialLoad = useRef(true)

    useEffect(() => {
        console.log('// useEffect')
        if (initialLoad.current) {
            console.log('// initial load, skipping useEffect…')
            initialLoad.current = false
            return
        }

        const getData = async () => {
            setIsLoading(true)

            const query = getFiltersQuery({ block, series })

            const url = process.env.GATSBY_DATA_API_URL
            if (!url) {
                throw new Error('GATSBY_DATA_API_URL env variable is not set')
            }
            const result = await runQuery(url, query, `${block.id}FiltersQuery`)
            // console.log(result)

            const [apiSegment, sectionSegment, fieldSegment, ...rest] = block.dataPath.split('.')
            const seriesData = result[sectionSegment][fieldSegment]
            const newBuckets = Object.values(seriesData).map(
                seriesItem => seriesItem.year.facets[0].buckets
            )
            const mergedBuckets = mergeBuckets({
                bucketsArrays: [defaultBuckets, ...newBuckets],
                completion
            })
            console.log(mergedBuckets)
            setBuckets(mergedBuckets)
            setIsLoading(false)
        }

        if (series.length > 0) {
            getData()
        }
    }, [series])

    return (
        <Wrapper_>
            <Contents_>{children}</Contents_>
            {isLoading && <Loading />}
        </Wrapper_>
    )
}

const Wrapper_ = styled.div`
    position: relative;
`
const Contents_ = styled.div``

export default DynamicDataLoader
