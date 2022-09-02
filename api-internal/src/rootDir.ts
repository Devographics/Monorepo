/**
 * This file must stay at the root of "src"
 * This way, "import.meta.url" will be "<some-folder>/dist/rootDir.ts"
 */
// @see https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
// /!\ __dirname must be recomputed for each file, don't try to move this code
import path from 'path'
import * as url from 'url'
export const rootDir = url.fileURLToPath(new URL('.', import.meta.url))
export const monorepoDir = path.resolve(rootDir, '../')
console.info('rootDir path is:', rootDir)
console.info('monorepoDir path is:', monorepoDir)
