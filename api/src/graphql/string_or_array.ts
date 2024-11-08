import { GraphQLScalarType, Kind, ValueNode } from 'graphql'

export const stringOrArray = new GraphQLScalarType({
    name: 'StringOrArray',
    description: 'A custom scalar that can be either a string or an array of strings',
    serialize(value: unknown): string | string[] {
        if (
            typeof value === 'string' ||
            (Array.isArray(value) && value.every(item => typeof item === 'string'))
        ) {
            return value
        }
        throw new TypeError('Value must be a string or an array of strings')
    },
    parseValue(value: unknown): string | string[] {
        if (
            typeof value === 'string' ||
            (Array.isArray(value) && value.every(item => typeof item === 'string'))
        ) {
            return value
        }
        throw new TypeError('Value must be a string or an array of strings')
    },
    parseLiteral(ast: ValueNode): string | string[] {
        if (ast.kind === Kind.STRING) {
            return ast.value
        } else if (ast.kind === Kind.LIST) {
            const values = ast.values.map(valueNode => {
                if (valueNode.kind === Kind.STRING) {
                    return valueNode.value
                }
                throw new TypeError('All elements in the array must be strings')
            })
            return values
        }
        throw new TypeError('Value must be a string or an array of strings')
    }
})
