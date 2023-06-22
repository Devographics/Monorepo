export const getSizeInKB = (obj: any) => {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj)
    // Get the length of the Uint8Array
    const bytes = new TextEncoder().encode(str).length
    return Math.round(bytes / 1000)
}

export const measureTime = async (f: any, message: string) => {
    const startAt = new Date()
    const result = await f()
    const endAt = new Date()
    console.log(
        `🕚 ${message} in ${endAt.getTime() - startAt.getTime()}ms (${getSizeInKB(result)}kb)`
    )
    return result
}
