'use client'
/**
 * Context that provides methods to access translated strings
 */
import { useContext, createContext, ReactNode } from 'react'
import { I18nToken, StringsRegistry } from './stringsRegistry'
import { Message } from './typings'

interface IntlContextValue {
    localeId: string
    stringsRegistry: StringsRegistry
}
export interface IntlContextFormat extends IntlContextValue {
    formatMessage: (msg: Message) => I18nToken
}

const makeContext = ({
    localeId,
    stringsRegistry
}: {
    localeId: string
    stringsRegistry: StringsRegistry
}): IntlContextFormat => ({
    localeId,
    stringsRegistry,
    formatMessage: ({ id, defaultMessage, values }: Message) => {
        const message = stringsRegistry.getString({
            id,
            defaultMessage,
            values,
            localeId
        })
        return message
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
    children: ReactNode
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
