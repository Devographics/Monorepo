import { AppName } from '@devographics/types'
import config_ from './variables.yml'

export enum EnvVar {
    CONFIG = 'CONFIG',
    APP_NAME = 'APP_NAME',
    API_URL = 'API_URL',
    APP_URL = 'APP_URL',
    DISABLE_API_CACHE = 'DISABLE_API_CACHE',
    DISABLE_CACHE = 'DISABLE_CACHE',
    CACHE_TYPE = 'CACHE_TYPE',
    DISABLE_FILESYSTEM_CACHE = 'DISABLE_FILESYSTEM_CACHE',
    DISABLE_REDIS_CACHE = 'DISABLE_REDIS_CACHE',
    MONGO_PRIVATE_URI = 'MONGO_PRIVATE_URI',
    MONGO_PRIVATE_URI_READONLY = 'MONGO_PRIVATE_URI_READONLY',
    MONGO_PRIVATE_DB = 'MONGO_PRIVATE_DB',
    MONGO_PUBLIC_URI = 'MONGO_PUBLIC_URI',
    MONGO_PUBLIC_DB = 'MONGO_PUBLIC_DB',
    REDIS_URL = 'REDIS_URL',
    REDIS_UPSTASH_URL = 'REDIS_UPSTASH_URL',
    REDIS_TOKEN = 'REDIS_TOKEN',
    GITHUB_TOKEN = 'GITHUB_TOKEN',
    GITHUB_PATH_SURVEYS = 'GITHUB_PATH_SURVEYS',
    GITHUB_PATH_LOCALES = 'GITHUB_PATH_LOCALES',
    GITHUB_PATH_ENTITIES = 'GITHUB_PATH_ENTITIES',
    EMAIL_OCTOPUS_APIKEY = 'EMAIL_OCTOPUS_APIKEY',
    DEFAULT_MAIL_FROM = 'DEFAULT_MAIL_FROM',
    SMTP_HOST = 'SMTP_HOST',
    SMTP_PORT = 'SMTP_PORT',
    SMTP_SECURE = 'SMTP_SECURE',
    SMTP_USER = 'SMTP_USER',
    SMTP_PASS = 'SMTP_PASS',
    ENCRYPTION_KEY = 'ENCRYPTION_KEY',
    SECRET_KEY = 'SECRET_KEY',
    I18N_SECRET_KEY = 'I18N_SECRET_KEY',
    ASSETS_URL = 'ASSETS_URL',
    NEXT_PUBLIC_ASSETS_URL = 'NEXT_PUBLIC_ASSETS_URL',
    LOGS_PATH = 'LOGS_PATH',
    SURVEYS_PATH = 'SURVEYS_PATH',
    LOCALES_PATH = 'LOCALES_PATH',
    ENTITIES_PATH = 'ENTITIES_PATH',
    ENABLE_CACHE = 'ENABLE_CACHE',
    PORT = 'PORT',
    EDITIONID = 'EDITIONID',
    SURVEYID = 'SURVEYID',
    LOCALE_IDS = 'LOCALE_IDS',
    LOCALE_CONTEXTS = 'LOCALE_CONTEXTS',
    CUSTOM_LOCALE_CONTEXTS = 'CUSTOM_LOCALE_CONTEXTS',
    FROZEN = 'FROZEN',
    // Feature flags
    FLAG_ENABLE_STRING_FILTER = 'FLAG_ENABLE_STRING_FILTER',
    SURVEYFORM_URL = 'SURVEYFORM_URL',
    DISABLE_DYNAMIC_OPTIONS = 'DISABLE_DYNAMIC_OPTIONS'
}

interface EnvVariable {
    id: EnvVar
    usedBy?: AppName[]
    description?: string
    example?: string
    optional?: boolean
    aliases?: EnvVar[]
}

export const config = config_ as EnvVariable[]

export const getVariables = () => config

export type DefaultConfigValues = Partial<Record<EnvVar, any>>

interface GetConfigOptions {
    showWarnings?: boolean
}

const formatVariable = ({ id, description, example }: EnvVariable) => {
    return `[${id}] ${description} (ex: ${example})`
}

let appNameGlobal: AppName
export const setAppName = (appName: AppName) => {
    appNameGlobal = appName
}

let envMapGlobal: Record<string, string> = {}
/**
 * Pass "import.meta.env" when using Vite
 * because this value cannot be obtained from within a different node_module
 */
export function setEnvMap(envMap: Record<string, string>) {
    envMapGlobal = envMap
}

export const getAppName = (appName: AppName) => {
    return appNameGlobal
}

const getValue = (variable: EnvVariable, defaultValues: DefaultConfigValues = {}) => {
    const { id, aliases } = variable
    // For Next.js public variables build,
    // we CAN'T move process.env to a variable like const env = process.env,
    // because Next rely on build-time injection when detecting process.env[something] explicitely
    const value = defaultValues[id] || process.env[id] || envMapGlobal[id]
    if (value) {
        return { id, value }
    } else if (aliases) {
        for (const aliasId of aliases) {
            const aliasValue = process.env[aliasId] || envMapGlobal[id]
            if (aliasValue) {
                return { id: aliasId, value: aliasValue }
            }
        }
    }
    return { id }
}

/**
 * Centralized configuration management for the whole Devographics infrastructure
 * See ./shared/helpers/variables.yml for the actual config
 *
 * Each app is still responsible for setting the default values for development
 * (via their readme, the tracked .env files etc.)
 */
export const getConfig = (
    options: GetConfigOptions = {},
    defaultValues: DefaultConfigValues = {}
) => {
    const { showWarnings = false } = options
    const appName =
        appNameGlobal || (getValue({ id: EnvVar.APP_NAME }, defaultValues)?.value as AppName)
    if (!appName) {
        throw new Error(
            'getConfig: please pass variable, set env variable, or call setAppName() to specify appName'
        )
    }
    defaultValues[EnvVar.APP_NAME] = appName

    const variables = {} as any
    const optionalVariables: EnvVariable[] = []
    const missingVariables: EnvVariable[] = []
    for (const variable of config) {
        const { usedBy, optional = false } = variable
        if ((usedBy || []).includes(appName)) {
            const { id, value } = getValue(variable, defaultValues)
            if (value) {
                variables[id] = value
            } else if (optional === true) {
                if (showWarnings) {
                    optionalVariables.push(variable)
                }
            } else {
                missingVariables.push(variable)
            }
        }
    }
    if (optionalVariables.length > 0) {
        console.warn(
            `getConfig/${appName}: The following optional environment variables were not defined:
${optionalVariables.map(formatVariable).join('\n')}`
        )
    }
    if (missingVariables.length > 0) {
        throw new Error(
            `getConfig/${appName}: Found the following missing environment variables:
${missingVariables.map(formatVariable).join('\n')}`
        )
    }
    return variables as { [id in EnvVar]: string }
}

type GetEnvVarOptions = {
    default?: any
    hardFail?: Boolean
    calledFrom?: string
}

export const getEnvVarMetadata = (id: EnvVar) => getVariables().find(v => v.id === id)

export const getEnvVar = (id: EnvVar, options: GetEnvVarOptions = {}) => {
    const config = getConfig()
    const { hardFail, calledFrom } = options
    let value = config[id] || options.default
    if (hardFail && typeof value === 'undefined') {
        const metadata = getEnvVarMetadata(id)
        throw new Error(
            `Environment variable ${id} not found (called from: ${calledFrom}) [${metadata?.description} | example: ${metadata?.example}]`
        )
    }
    if ([1, 'true', 'TRUE'].includes(value)) {
        value = true
    }
    if ([0, 'false', 'FALSE'].includes(value)) {
        value = false
    }
    return value
}
