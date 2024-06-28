'use client'
/**
 * Context that provides methods to access translated strings
 */
import { useContext, createContext } from 'react'
import { StringsRegistry } from './stringsRegistry'
import { Message } from './typings'

interface IntlContextValue {
    localeId: string
    stringsRegistry: StringsRegistry
}
export interface IntlContextFormat extends IntlContextValue {
    formatMessage: (msg: Message) => string
}

const makeContext = ({ localeId, stringsRegistry }: { localeId: string, stringsRegistry: StringsRegistry }): IntlContextFormat => ({
    localeId,
    stringsRegistry,
    formatMessage: ({ id, defaultMessage, values }: Message) => {
        const str = stringsRegistry.getString({
            id,
            defaultMessage,
            values,
            localeId
        })
        return str
    }
})

export const IntlContext = createContext<IntlContextFormat>(
    // default values: return tokens as is
    makeContext({
        localeId: 'NOT_INITIALIZED',
        stringsRegistry: new StringsRegistry('NOT_INITIALIZED')
    })
)

export interface IntlProviderProps extends IntlContextValue {
    children: React.ReactNode
}
export const IntlContextProvider = ({
    localeId,
    stringsRegistry,
    children,
    ...props
}: IntlProviderProps) => {
    // merge parent strings if any (default registry is just empty)
    const currentContext = useIntlContext()
    stringsRegistry.mergeTokens(currentContext.stringsRegistry)

    const formatters = makeContext({ localeId, stringsRegistry })
    return (
        <IntlContext.Provider value={formatters} {...props}>
            {children}
        </IntlContext.Provider>
    )
}

/**
 * @deprecated
 */
export const useIntlContext = () => useContext(IntlContext)
