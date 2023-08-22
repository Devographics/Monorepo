import { flushLogs, logger } from './logger'
import { getConfig } from './config'

export const parseCliConfig = async () => {
    const args = process.argv
    const resultsPath = args[2]
    if (!resultsPath) {
        logger.error(`no survey results path provided`)
        await flushLogs()
        process.exit(1)
    }

    const outputDir = args[3]
    if (!outputDir) {
        logger.error(`no output directory provided`)
        await flushLogs()
        process.exit(1)
    }

    const startFromLocale = args[4]

    return getConfig(resultsPath, outputDir, startFromLocale)
}
