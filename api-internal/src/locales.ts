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

export const allContexts: string[] = []

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

export const getValidLocale = async (localeId: string, context: RequestContext) => {
    const locales = await getLocalesMetadata(context)
    const exactLocale = locales.find(
        ({ id }: { id: string }) => id.toLowerCase() === localeId.toLowerCase()
    )
    const similarLocale = locales.find(
        ({ id }: { id: string }) => truncateKey(id) === truncateKey(localeId)
    )

    const validLocale = exactLocale || similarLocale
    if (!validLocale) {
        throw Error(`No valid locale found for id ${localeId}`)
    } else {
        return validLocale
    }
}

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// Load From Cache /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

export const getLocaleRawContextCacheKey = (localeId: string, context: string) =>
    `locale_${localeId}_${context}_raw`
export const getLocaleParsedContextCacheKey = (localeId: string, context: string) =>
    `locale_${localeId}_${context}_parsed`
// export const getLocaleMetaDataCacheKey = (localeId: string) => `locale_${localeId}_metadata`
export const getLocaleUntranslatedKeysCacheKey = (localeId: string) =>
    `locale_${localeId}_untranslated`
export const getAllLocalesMetadataCacheKey = () => 'locale_all_locales_metadata'

/*

Get locale metadata (untranslated keys get their own resolver)

*/
export const getLocaleMetaData = async (
    localeId: string,
    context: RequestContext
): Promise<LocaleMetaData> => {
    const allLocales = await getLocalesMetadata(context)
    return allLocales.find((l: Locale) => l.id === localeId)
}

/*

Get locales metadata from cache (untranslated keys get their own resolver)

*/
export const getLocalesMetadata = async (context: RequestContext) => {
    return await getCache(getAllLocalesMetadataCacheKey(), context)
}

/*

Get locale strings from cache and flatten them

*/
export const getLocaleStrings = async (
    localeId: string,
    contexts: string[] = allContexts,
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
    return flattenStringFiles(stringFiles, true)
}

/*

Flatten an array of stringfiles into a single array of strings with context

*/
export const flattenStringFiles = (
    stringFiles: StringFile[],
    addContext: boolean = false
): TranslationStringObject[] => {
    // flatten all stringFiles together
    const stringObjects = stringFiles
        .map((sf: StringFile) => {
            let { strings, context } = sf
            if (strings === null) {
                return []
            }
            if (addContext) {
                // add context to all strings
                strings = strings.map((s: TranslationStringObject) => ({ ...s, context }))
            }
            return strings
        })
        .flat()

    return stringObjects
}

///////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////// Resolvers ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/*

Get a specific locale object (strings get their own separate resolver)

*/
export interface LocaleWithExtraProps extends Locale {
    contexts?: string[]
}
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
}): Promise<LocaleWithExtraProps> => {
    const validLocale = await getValidLocale(localeId, context)
    // return contexts so nested resolvers (i.e. strings resolver) can access them
    const locale = { ...validLocale, contexts }
    console.log(localeId)
    console.log(validLocale)
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
    const { localeIds, context } = options
    const allLocales = await getLocalesMetadata(context)
    return localeIds ? allLocales.filter((l: Locale) => localeIds.includes(l.id)) : allLocales
}

/*

Get a specific translation

Reverse array first so that strings added last take priority

*/
export const getTranslation = async (key: string, localeId: string, context: RequestContext) => {
    const locale = await getLocale({ localeId, context })
    return locale?.strings?.reverse().find((s: any) => s.key === key)
}
