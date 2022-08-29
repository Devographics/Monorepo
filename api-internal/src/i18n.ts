import { EnumTypeDefinitionNode } from 'graphql'
import {
    StringFile,
    Locale,
    TranslationStringObject,
    RequestContext,
    LocaleMetaData
} from './types'
import typeDefs from './type_defs/schema.graphql'
import { getCache } from './caching'
import allContexts from './data/contexts.yml'

///////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// Helpers //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/**
 * Return either e.g. other_tools.browsers.choices or other_tools.browsers.others_normalized
 */
export const getOtherKey = (id: string) =>
    id.includes('_others') ? `${id.replace('_others', '')}.others_normalized` : `${id}.choices`

export const getGraphQLEnumValues = (name: string): string[] => {
    const enumDef = typeDefs.definitions.find(def => {
        return def.kind === 'EnumTypeDefinition' && def.name.value === name
    }) as EnumTypeDefinitionNode

    if (enumDef === undefined) {
        throw new Error(`No enum found matching name: ${name}`)
    }

    return enumDef.values!.map(v => v.name.value)
}

/*

For a given locale id, get closest existing key.

Ex: 

en-US -> en-US
en-us -> en-US
en-gb -> en-US
etc. 

*/
export const truncateKey = (key: string) => key.split('-')[0]

export const getValidLocaleId = async (localeId: string, context: RequestContext) => {
    const localeIdsList = await getLocaleIds(context)
    const exactLocaleId = localeIdsList.find(
        (lId: string) => lId.toLowerCase() === localeId.toLowerCase()
    )
    const similarLocaleId = localeIdsList.find(
        (lId: string) => truncateKey(lId) === truncateKey(localeId)
    )

    const validLocaleId = exactLocaleId || similarLocaleId
    if (!validLocaleId) {
        throw Error(`No valid locale found for id ${localeId}`)
    } else {
        return validLocaleId
    }
}

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// Load From Cache /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

export const getLocaleRawContextCacheKey = (localeId: string, context: string) => `${localeId}_${context}_raw`
export const getLocaleParsedContextCacheKey = (localeId: string, context: string) => `${localeId}_${context}_parsed`
export const getLocaleMetaDataCacheKey = (localeId: string) => `${localeId}_metadata`
export const getAllLocalesListCacheKey = () => 'all_locales_ids'

/*

Get locale metadata from cache

*/
export const getLocaleMetaData = async (
    localeId: string,
    context: RequestContext
): Promise<LocaleMetaData> => {
    return await getCache(getLocaleMetaDataCacheKey(localeId), context)
}

/*

Get locale ids list from cache

*/
export const getLocaleIds = async (context: RequestContext) => {
    return await getCache(getAllLocalesListCacheKey(), context)
}

/*

Get locale strings from cache and flatten them

*/
export const getLocaleStrings = async (
    localeId: string,
    contexts: string[],
    context: RequestContext
) => {
    const stringFiles = []
    for (const c of contexts) {
        const stringFile = await getCache(getLocaleParsedContextCacheKey(localeId, c), context)
        if (stringFile) {
            // not all contexts exist for all languages
            stringFiles.push(stringFile)
        }
    }
    return flattenStringFiles(stringFiles)
}

/*

Flatten an array of stringfiles into a single array of strings with context

*/
export const flattenStringFiles = (stringFiles: StringFile[]): TranslationStringObject[] => {
    // flatten all stringFiles together
    const stringObjects = stringFiles
        .map((sf: StringFile) => {
            let { strings, context } = sf
            if (strings === null) {
                return []
            }
            // add context to all strings
            strings = strings.map((s: TranslationStringObject) => ({ ...s, context }))
            return strings
        })
        .flat()

    return stringObjects
}

/*

Get locale strings

*/
export const getLocaleObject = async ({
    localeId,
    contexts: providedContexts,
    context
}: {
    localeId: string
    contexts?: string[]
    context: RequestContext
}) => {
    const contexts = providedContexts ? providedContexts : allContexts
    const strings = await getLocaleStrings(localeId, contexts, context)
    const metadata = await getLocaleMetaData(localeId, context)
    return {
        ...metadata,
        strings
    }
}

///////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// Resolvers ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/*

Get a specific locale object with properly parsed strings

*/
export const getLocale = async ({
    localeId,
    contexts,
    enableFallbacks = true,
    context
}: {
    localeId: string
    contexts?: string[]
    enableFallbacks?: boolean
    context: RequestContext
}): Promise<Locale> => {
    const validLocaleId = await getValidLocaleId(localeId, context)
    const locale = getLocaleObject({ localeId: validLocaleId, contexts, context })
    return locale
}

/*

Get multiple locales

*/
export const getLocales = async (options: {
    contexts?: string[]
    enableFallbacks?: boolean
    localeIds: string[]
    context: RequestContext
}) => {
    const locales = []
    const { localeIds: providedLocaleIds, context } = options
    const localeIds = providedLocaleIds || (await getLocaleIds(context))
    for (const localeId of localeIds) {
        const locale = await getLocale({ localeId, ...options })
        locales.push(locale)
    }
    return locales
}

/*

Get a specific translation

Reverse array first so that strings added last take priority

*/
export const getTranslation = async (key: string, localeId: string, context: RequestContext) => {
    const locale = await getLocale({ localeId, context })
    return locale?.strings?.reverse().find((s: any) => s.key === key)
}
