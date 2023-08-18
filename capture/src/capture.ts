import { captureLocales } from './locales'
import { parseCliConfig } from './cli'

export const capture = async () => {
    const config = await parseCliConfig()

    await captureLocales(config)
}
