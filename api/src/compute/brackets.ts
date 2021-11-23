import { Db } from 'mongodb'
import { YearCompletion, SurveyConfig } from '../types'
import { TermAggregationOptions } from '../compute/generic'
import config from '../config'
import { generateFiltersQuery } from '../filters'
import { inspect } from 'util'
import idsLookupTable from '../data/ids.yml'
import { getWinsPipeline, getMatchupsPipeline } from './brackets_pipelines'
import { getParticipationByYearMap } from './demographics'
import { computeCompletionByYear, CompletionResult } from './completion'
import uniq from 'lodash/uniq'
import { ratioToPercentage } from './common'
import orderBy from 'lodash/orderBy'

// Wins

export interface WinsStats {
    count: number
    percentage: number
}

export interface WinsBucket {
    id: number | string
    round1: WinsStats
    round2: WinsStats
    round3: WinsStats
    combined: WinsStats
    year: number
}

export interface WinsYearAggregations {
    year: number
    total: number
    completion: YearCompletion
    buckets: WinsBucket[]
}

// Matchups

export interface MatchupAggregationResult {
    id: number
    year: number
    matchups: MatchupStats[]
}

export interface MatchupStats {
    id: number | string
    count: number
    percentage: number
}

export interface MatchupBucket {
    id: number | string
    matchups: MatchupStats[]
}

export interface MatchupYearAggregations {
    year: number
    total: number
    completion: YearCompletion
    buckets: MatchupBucket[]
}

export const winsAggregationFunction = async (
    db: Db,
    survey: SurveyConfig,
    key: string,
    options: TermAggregationOptions = {}
) => {
    const collection = db.collection(config.mongo.normalized_collection)

    const { filters, sort = 'total', order = -1, year }: TermAggregationOptions = options

    const match: any = {
        survey: survey.survey,
        [key]: { $nin: [null, '', []] },
        ...generateFiltersQuery(filters)
    }
    // if year is passed, restrict aggregation to specific year
    if (year) {
        match.year = year
    }

    const winsPipeline = getWinsPipeline(match, key)

    const rawResults = (await collection.aggregate(winsPipeline).toArray()) as WinsBucket[]

    console.log(
        inspect(
            {
                match,
                winsPipeline,
                rawResults
            },
            { colors: true, depth: null }
        )
    )

    // add proper ids
    const resultsWithId = rawResults.map(result => ({
        ...result,
        id: idsLookupTable[key][result.id]
    }))

    const totalRespondentsByYear = await getParticipationByYearMap(db, survey)
    const completionByYear = await computeCompletionByYear(db, match)

    // group by years and add counts
    const resultsByYear = await groupByYears(resultsWithId, db, survey, match, totalRespondentsByYear, completionByYear)
    
    // console.log(JSON.stringify(resultsByYear, '', 2))
    return resultsByYear
}

export const matchupsAggregationFunction = async (
    db: Db,
    survey: SurveyConfig,
    key: string,
    options: TermAggregationOptions = {}
) => {
    const collection = db.collection(config.mongo.normalized_collection)

    const { filters, sort = 'total', order = -1, year }: TermAggregationOptions = options

    const match: any = {
        survey: survey.survey,
        [key]: { $nin: [null, '', []] },
        ...generateFiltersQuery(filters)
    }

    // if year is passed, restrict aggregation to specific year
    if (year) {
        match.year = year
    }

    const matchupsPipeline = getMatchupsPipeline(match, key)
    const rawResults = (await collection.aggregate(matchupsPipeline).toArray()) as MatchupAggregationResult[]

    console.log(
        inspect(
            {
                match,
                matchupsPipeline,
                rawResults
            },
            { colors: true, depth: null }
        )
    )

    // add proper ids
    // const resultsWithId = rawResults.map(result => ({
    //     ...result,
    //     id: idsLookupTable[key][result.id]
    // }))
    rawResults.forEach(result => {
        result.id = idsLookupTable[key][result.id]
        result.matchups = result.matchups.map(matchup => ({
            ...matchup,
            id: idsLookupTable[key][matchup.id]
        }))
    })

    // console.log('// resultsWithId')
    // console.log(JSON.stringify(rawResults, '', 2))

    const totalRespondentsByYear = await getParticipationByYearMap(db, survey)
    const completionByYear = await computeCompletionByYear(db, match)

    // group by years and add counts
    const resultsByYear = await groupByYears(rawResults, db, survey, match, totalRespondentsByYear, completionByYear)

    // console.log('// resultsByYear')
    // console.log(JSON.stringify(resultsByYear, '', 2))

    return resultsByYear
}


interface GroupByYearResult {
    id: string | number
    year: number
}

export async function groupByYears(
    results: GroupByYearResult[],
    db: Db,
    survey: SurveyConfig,
    match: any,
    totalRespondentsByYear: {
        [key: number]: number
    },
    completionByYear: Record<number, CompletionResult>,
    values?: string[] | number[]
) {
    const years = uniq(results.map(r => r.year))

    const resultsWithYears = years.map((year: number) => {
        const totalRespondents = totalRespondentsByYear[year] ?? 0
        const completionCount = completionByYear[year]?.total ?? 0

        let yearBuckets = results.filter(r => r.year === year)

        // 1. Sort values
        // if a list of valid values is provided, make sure the bucket uses the same ordering
        if (values) {
            yearBuckets = [...yearBuckets].sort((a, b) => {
                // make sure everything is a string to avoid type mismatches
                const stringValues = values.map(v => v.toString())
                return stringValues.indexOf(a.id.toString()) - stringValues.indexOf(b.id.toString())
            })
        }

        // 2. Add completion counts
        const yearObject = {
            year,
            total: totalRespondents,
            completion: {
                total: totalRespondents,
                count: completionCount,
                percentage: ratioToPercentage(completionCount / totalRespondents)
            },
            buckets: yearBuckets
        }
        return yearObject
    })

    return orderBy(resultsWithYears, 'year')
}