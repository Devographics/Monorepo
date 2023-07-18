// see https://kamranicus.com/handling-multiple-scalar-types-in-graphql/
import { Kind } from 'graphql'

export const stringOrInt = {
    name: 'StringOrInt',
    description: 'A String or an Int union type',
    serialize(value: any) {
        if (typeof value !== 'string' && typeof value !== 'number') {
            throw new Error('Value must be either a String or an Int')
        }

        if (typeof value === 'number' && !Number.isInteger(value)) {
            throw new Error('Number value must be an Int')
        }

        return value
    },
    parseValue(value: any) {
        if (typeof value !== 'string' && typeof value !== 'number') {
            throw new Error('Value must be either a String or an Int')
        }

        if (typeof value === 'number' && !Number.isInteger(value)) {
            throw new Error('Number value must be an Int')
        }

        return value
    },
    parseLiteral(ast: any) {
        // Kinds: http://facebook.github.io/graphql/June2018/#sec-Type-Kinds
        // ast.value is always a string
        switch (ast.kind) {
            case Kind.INT:
                return parseInt(ast.value, 10)
            case Kind.STRING:
                return ast.value
            default:
                throw new Error('Value must be either a String or an Int')
        }
    }
}
