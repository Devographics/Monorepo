import fs from 'fs'
import fetch from 'node-fetch'

export const getLocalString = async ({ localPath }: { localPath: string }) => {
    let contents
    if (fs.existsSync(localPath)) {
        contents = fs.readFileSync(localPath, 'utf8')
    }
    return contents
}

export const getLocalJSON = async ({ localPath }: { localPath: string }) => {
    let data
    const contents = await getLocalString({ localPath })
    if (!contents) {
        throw new Error(`getLocalJSON: path ${localPath} did not return any content`)
    }
    try {
        data = JSON.parse(contents)
    } catch (error) {
        return
    }
    return data
}
