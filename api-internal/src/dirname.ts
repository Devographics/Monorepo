// @see https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
import * as url from 'url'
export const __filename = url.fileURLToPath(import.meta.url)
export const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
