import { gzip as zlibGzip, gunzip as zlibGunzip } from 'zlib'
import { promisify } from 'util'

// Promisify the zlib.gzip function
const gzip = promisify(zlibGzip)

export async function compressJSON(data) {
    try {
        // Convert JSON object to string
        const jsonString = JSON.stringify(data)

        // Compress JSON string
        const compressedBuffer = (await gzip(jsonString)) as Buffer

        // Convert the compressed buffer to base64 string (optional)
        const base64String = compressedBuffer.toString('base64')

        return base64String
    } catch (err) {
        console.error('Error compressing JSON', err)
        throw err
    }
}

// Promisify the zlib.gunzip function
const gunzip = promisify(zlibGunzip)

export async function decompressJSON(compressedString) {
    try {
        // Convert the base64 string to a buffer
        const compressedBuffer = Buffer.from(compressedString, 'base64')

        // Decompress the buffer
        // @ts-ignore should be using an ArrayBuffer maybe ?
        const decompressedBuffer = (await gunzip(compressedBuffer)) as Buffer

        // Convert the buffer to a JSON string
        const jsonString = decompressedBuffer.toString()

        // Parse the JSON string to a JSON object
        const data = JSON.parse(jsonString)

        return data
    } catch (err) {
        console.error('Error decompressing JSON', err)
        throw err
    }
}
