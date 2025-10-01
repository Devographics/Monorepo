export const getSizeInKB = (obj: any) => {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj)
    // Get the length of the Uint8Array
    const bytes = new TextEncoder().encode(str).length
    return Math.round(bytes / 1000)
}

export const measureTime = async (run: any, message: string) => {
    const startAt = new Date()
    const result = await run()
    const endAt = new Date()
    console.log(
        `🕚 ${message} in ${endAt.getTime() - startAt.getTime()}ms (${getSizeInKB(result)}kb)`
    )
    return result
}

export const isToolTemplate = (template?: string) =>
    template && ['tool', 'toolv3'].includes(template)

export const isFeatureTemplate = (template?: string) =>
    template && ['feature', 'featurev3'].includes(template)

export function concatPath(...segments: string[]) {
    if (segments.length === 0) {
        return ''
    }

    return segments.reduce((acc, curr) => {
        if (acc.endsWith('/') || curr.startsWith('/')) {
            return acc + curr
        } else {
            return acc + '/' + curr
        }
    })
}

/**
 * Example:
 * APOLLO_SERVER_CORS_WHITELIST=http://localhost:5000,https://www.my-client.org
 * => parse the string and makes it an array
 * @param {*} variable Env array variables, with values separated by a comma (spaces allowed)
 */
export const parseEnvVariableArray = (variable = '') => {
    if (!variable) return []
    return variable.split(',').map(s => s.trim())
}

export const isAbsoluteUrl = (url?: string) => {
    if (!url) return false
    return url.indexOf('//') !== -1
}
