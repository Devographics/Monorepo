import { DynamicT, type TProps } from "./DynamicT"
/**
 * Helper that helps listing the tokens required by client component.
 *
 * Should be called top-level,
 * should include tokens from children,
 * result should be exported (so parent can import tokens, forming a chain until we reach the function that filters the tokens)
 * 
 * @example 
 * ```js
 * // Notice the "as const", it allows proper typing
 *
 * export const { T, tokens } = teapot(["some.token.{{surveyId}}", ...tokensOfChildComponent] as const)
 * 
 * function MyComponent() { return <T token={"some.token.{{surveyId}}"} /> }
 * ```
 * 
 * ## When to use
 * 
 * - Everytime you use a known token like "home.title"
 * - Works with token expressions too like "{{surveyId}}.home.title"
 * 
 * ## When not to use
 * 
 * - For low-level UI component that gets the token from their parent,
 * for instance dropdown items etc.
 * They can use the normal "T" component exported by @devographics/react-i18n
 * Their parent will take care of calling "teapot"
 * 
 * ## Type-safety
 *
 * 
 * Using the returned T component is completely optional,
 * it only adds type safety over the usual "T" component exported from react-i18n
 * 
 * ## RSC
 * 
 * For React Server Components, see "rscTeapot" instead and the "ServerT" component.
 * 
 * @param tokenExprs A list of token expressions as strings
 * 
 */
export function teapot<TExprs extends Readonly<Array<string>>>(tokenExprs: TExprs) {
    // @ts-ignore
    return {
        /** 
         * Courtesy, a T function with typesafety based on the provided tokens
         * Works exactly the same as the imported T function
         * We can still use "useTeapot" to get "t", "getMessage" functions
         */
        T: (props: Omit<TProps, "token"> & { token: TExprs[number] }) => <DynamicT {...props} />,
        tokens: tokenExprs
    }
}