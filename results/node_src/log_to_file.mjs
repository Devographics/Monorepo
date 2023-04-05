import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

/*

Log to file

*/
export const logToFile = async (fileName, object, options = {}) => {
    try {
        if (process.env.NODE_ENV !== 'production') {
            const { mode = 'append', timestamp = false, subDir, dirPath, editionId } = options

            const logsDirPath = dirPath
                ? path.resolve(dirPath)
                : `${__dirname}/.logs${editionId ? `/${editionId}` : ''}${
                      subDir ? `/${subDir}` : ''
                  }`
            if (!fs.existsSync(logsDirPath)) {
                fs.mkdirSync(logsDirPath, { recursive: true })
            }
            const fullPath = `${logsDirPath}/${fileName}`
            const contents = typeof object === 'string' ? object : JSON.stringify(object, null, 2)
            const now = new Date()
            const text = timestamp ? now.toString() + '\n---\n' + contents : contents
            if (mode === 'append') {
                const stream = fs.createWriteStream(fullPath, { flags: 'a' })
                stream.write(text + '\n')
                stream.end()
            } else {
                fs.writeFile(fullPath, text, error => {
                    // throws an error, you could also catch it here
                    if (error) throw error

                    // eslint-disable-next-line no-console
                    console.log(`Object saved to ${fullPath}`)
                })
            }
        }
    } catch (error) {
        console.warn(`// error while trying to log out ${fileName}`)
    }
}
