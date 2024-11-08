import { GraphQLScalarType, Kind, ValueNode } from 'graphql'

const StringOrFloatOrArray = new GraphQLScalarType({
    name: 'StringOrFloatOrArray',
    description:
        'A custom scalar that can be either a string, a float, or an array of strings and/or floats',
    serialize(value: unknown): string | number | (string | number)[] {
        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            (Array.isArray(value) &&
                value.every(item => typeof item === 'string' || typeof item === 'number'))
        ) {
            return value
        }
        throw new TypeError('Value must be a string, a float, or an array of strings and/or floats')
    },
    parseValue(value: unknown): string | number | (string | number)[] {
        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            (Array.isArray(value) &&
                value.every(item => typeof item === 'string' || typeof item === 'number'))
        ) {
            return value
        }
        throw new TypeError('Value must be a string, a float, or an array of strings and/or floats')
    },
    parseLiteral(ast: ValueNode): string | number | (string | number)[] {
        if (ast.kind === Kind.STRING) {
            return ast.value
        } else if (ast.kind === Kind.FLOAT) {
            return parseFloat(ast.value)
        } else if (ast.kind === Kind.LIST) {
            const values = ast.values.map(valueNode => {
                if (valueNode.kind === Kind.STRING) {
                    return valueNode.value
                } else if (valueNode.kind === Kind.FLOAT) {
                    return parseFloat(valueNode.value)
                }
                throw new TypeError('All elements in the array must be strings or floats')
            })
            return values
        }
        throw new TypeError('Value must be a string, a float, or an array of strings and/or floats')
    }
})

export default StringOrFloatOrArray
