import template from 'lodash/template'
import { SUPPORT_MULTIPLE_YEARS } from './constants'
import { ExplorerData } from './types'

export const getFacetPath = (section: string, field: string) => `${section}/${field}`

export const getFacetSegments = (facet: string) => {
    const [sectionName, fieldName] = facet?.includes('/')
        ? facet.split('/')
        : ['demographics', facet]
    return { sectionName, fieldName }
}

export const getSizeInKB = (obj: any) => {
  const str = JSON.stringify(obj)
  // Get the length of the Uint8Array
  const bytes = new TextEncoder().encode(str).length
  return Math.round(bytes / 1000)
}

interface QueryVariables {
    surveyType: string
    facet1: string
    facet2: string
    currentYear: number
}

export const getQuery = (queryTemplate: string, variables: QueryVariables) => {
    const query = queryTemplate.slice(queryTemplate.indexOf('dataAPI')).replace('dataAPI', 'query ExplorerQuery')
    const t = template(query)
    return t(variables)
}

export const runQuery = async (url: string, query: string, queryName: string, variables: any = {}): Promise<any> => {
    const startAt = new Date()
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query, variables
        })
    })
    const text = await response.text()
    const endAt = new Date()
    try {
        const json = JSON.parse(text) // Try to parse it as JSON
        if (json.errors) {
            throw new Error(json.errors[0].message)
        }
        console.log(
            `🕚 Ran query ${queryName} in ${endAt.getTime() - startAt.getTime()}ms (${getSizeInKB(
                json
            )}kb) | ${url}`
        )

        return json.data
    } catch (error) {
        console.log(`// runQuery error (API_URL: ${url})`)
        console.log(text)
        throw new Error(error)
    }
}

// if we only need to support a single year, wrap year object in array for consistency
export const formatData = (originalData: ExplorerData) => {
    if (SUPPORT_MULTIPLE_YEARS) {
        return originalData
    } else {
        const { year, ...rest } = originalData
        return {...rest, all_years: [year] }
    }
}