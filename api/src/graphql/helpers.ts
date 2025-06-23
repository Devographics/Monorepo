// see https://spec.graphql.org/October2021/#sec-Names
export const isValidGraphQLName = (s: string) => {
    const graphqlEnumPattern = /^[_A-Za-z][_0-9A-Za-z]*$/
    return graphqlEnumPattern.test(s)
}
