
import { initLocales } from './locales_cache'
import { initEntities } from './entities'
import { RequestContext } from './types'

export const init = async ({ context }: { context: RequestContext }) => {
    await initLocales({ context })
    await initEntities()
}
