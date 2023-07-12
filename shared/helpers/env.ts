import config_ from './variables.yml'

export enum AppName {
    SURVEYFORM = 'surveyform',
    SURVEYADMIN = 'surveyadmin',
    API = 'api',
    RESULTS = 'results',
    GRAPHIQL = 'graphiql'
}

export enum EnvVar {
    APP_NAME = 'APP_NAME',
    API_URL = 'API_URL',
    MONGO_URI = 'MONGO_URI',
    MONGO_PRIVATE_DB = 'MONGO_PRIVATE_DB',
    MONGO_PUBLIC_DB = 'MONGO_PUBLIC_DB',
    REDIS_URL = 'REDIS_URL',
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
    ASSETS_URL = 'ASSETS_URL',
    LOGS_PATH = 'LOGS_PATH',
    SURVEYS_PATH = 'SURVEYS_PATH',
    LOCALES_PATH = 'LOCALES_PATH',
    ENTITIES_PATH = 'ENTITIES_PATH',
    ENABLE_CACHE = 'ENABLE_CACHE',
    PORT = 'PORT'
}

interface EnvVariable {
    id: EnvVar
    usedBy: AppName[]
    description?: string
    example?: string
    optional?: boolean
}

const config = config_ as EnvVariable[]

interface GetConfigOptions {
    appName?: AppName
    showWarnings?: boolean
}

const formatVariable = ({ id, description, example }: EnvVariable) => {
    return `[${id}] ${description} (ex: ${example})`
}

let appNameGlobal: AppName
export const setAppName = (appName: AppName) => {
    appNameGlobal = appName
}

export const getConfig = (options: GetConfigOptions = {}) => {
    const { appName: appName_, showWarnings = false } = options
    const appName = appName_ || appNameGlobal
    if (!appName) {
        throw new Error('getConfig: please pass appName or specify APP_NAME env variable')
    }
    const variables = {} as any
    const optionalVariables = []
    const missingVariables = []
    for (const variable of config) {
        const { id, usedBy, optional = false } = variable
        if (usedBy.includes(appName)) {
            const value = process.env[id]
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
            `The following optional environment variables were not defined:
${optionalVariables.map(formatVariable).join('\n')}`
        )
    }
    if (missingVariables.length > 0) {
        throw new Error(
            `getConfig: Found the following missing environment variables:
${missingVariables.map(formatVariable).join('\n')}`
        )
    }
    return variables
}

export const getEnvVar = (id: EnvVar) => {
    const config = getConfig()
    return config[id]
}
