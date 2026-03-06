type GraphqlLiteral = {
    kind: 'literal'
    value: string
}

type GraphqlPrimitive = string | number | boolean | null

type GraphqlInputValue = GraphqlPrimitive | GraphqlLiteral | GraphqlInputValue[]

type GraphqlResponse<T> = {
    data?: T
    errors?: Array<{ message: string }>
}

const GRAPHQL_PLACEHOLDER_PATTERN = /__([A-Z0-9_]+)__/g

const getGraphqlApiUrl = () => {
    const apiUrl = process.env.API_URL || process.env.GATSBY_API_URL
    if (!apiUrl) {
        throw new Error('Missing API_URL (or GATSBY_API_URL)')
    }
    return apiUrl
}

const formatGraphqlValue = (value: GraphqlInputValue): string => {
    if (Array.isArray(value)) {
        return `[${value.map(item => formatGraphqlValue(item)).join(', ')}]`
    }

    if (
        typeof value === 'object' &&
        value !== null &&
        'kind' in value &&
        value.kind === 'literal'
    ) {
        return value.value
    }

    if (typeof value === 'string') {
        return JSON.stringify(value)
    }

    if (value === null) {
        return 'null'
    }

    return String(value)
}

export const graphqlLiteral = (value: string): GraphqlLiteral => ({
    kind: 'literal',
    value
})

export const interpolateGraphqlDocument = (
    document: string,
    replacements: Record<string, GraphqlInputValue>
) =>
    document.replace(GRAPHQL_PLACEHOLDER_PATTERN, (_, key: string) => {
        const value = replacements[key]
        if (typeof value === 'undefined') {
            throw new Error(`Missing GraphQL placeholder value for ${key}`)
        }
        return formatGraphqlValue(value)
    })

export const requestGraphql = async <T>(query: string): Promise<T> => {
    const response = await fetch(getGraphqlApiUrl(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({ query, variables: {} })
    })

    if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
    }

    const json = (await response.json()) as GraphqlResponse<T>

    if (json.errors?.length) {
        throw new Error(json.errors.map(error => error.message).join('\n'))
    }

    if (!json.data) {
        throw new Error('GraphQL response did not contain data')
    }

    return json.data
}
