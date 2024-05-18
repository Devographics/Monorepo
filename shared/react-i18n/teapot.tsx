import { T, type TProps } from "./T"
/**
 * Temporary solution to generate a typed T component
 * This will be replaced by a "normal" T component + a bundler plugin that collects all calls to "T"
 * in order to list the tokens needed by a given component
 * 
 * @example 
 * export const { T, tokens } = teapot(["some.token.{{surveyId}}", ...tokensOfChildComponent] as const)
 * function MyComponent() { return <T token={"some.token.{{surveyId}}"} /> }
 * 
 * The "as const" is helpful for avoiding typo in the React Component
 * 
 * @param tokenExprs A list of token expressions as strings
 */
export function teapot<T extends Readonly<Array<string>>>(tokenExprs: T) {
    // @ts-ignore
    return {
        T: (props: Omit<TProps, "token"> & { token: T[number] }) => <T {...props} />,
        tokens: tokenExprs
    }
}