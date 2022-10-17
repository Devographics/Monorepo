export const isAbsoluteUrl = (url?: string) => {
    if (!url) return false
    return url.indexOf("//") !== -1
}