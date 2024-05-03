/**
 * TS utility to convert the array of token expressions
 * into a map with known field
 * TODO: that's the worst TS code ever seen please send help
 * @param tokenExpressions 
 * @returns 
 */
export function tokensAsMap<T extends Readonly<Array<string>>>(tokenExpressions: T): { [key in T[number]]: T[number] } {
    // @ts-ignore
    return tokenExpressions.reduce((asMap, token) => ({ ...asMap, [token]: token }), {})
}