/**
 * For Next.js, we want to make debugger tooling (namely opening file)
 * edge runtime friendly,
 * because we may not be able to detect the current environment from a deeply nested shared utility
 * 
 * Note: this escape hatch should not be abused too often
 * 
 * Can be used for a dynamic import
 * 
 * 
 *   if (!isNode()) {
 *       return
 *   }
 *   const helpers = await import('./log_to_file')
 *   return helpers.logToFile(fileName, object, options)
 */
export const isNode = () => {
    if (!process.env.NEXT_RUNTIME || process.env.NEXT_RUNTIME === 'nodejs') {
        return true
    } else {
        return false
    }
}
