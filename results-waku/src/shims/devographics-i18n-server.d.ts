declare module '@devographics/i18n/server' {
    export type Translation = {
        key: string
        t: string
        tHtml?: string
        tClean?: string
    }

    export type LocaleParsed = {
        id: string
        label?: string
        completion?: number
        repo?: string
        totalCount?: number
        translatedCount?: number
        translators?: string[]
        strings?: Translation[]
        dict: Record<string, Translation>
        contexts?: string[]
    }

    export function getAllLocaleDefinitions(): Promise<{
        error?: Error
        locales?: Array<{
            id: string
            label?: string
            completion?: number
            translators?: string[]
            active?: boolean
        }>
    }>

    export function getLocaleDict(args: {
        localeId: string
        contexts: string[]
    }): Promise<{
        error?: Error
        locale?: LocaleParsed
    }>
}
