// @see https://github.com/vercel/next.js/discussions/15453#discussioncomment-6226391
import fs from "fs"

/**
 * Took this syntax from https://github.com/MattMorgis/async-stream-generator
 * Didn't find proper documentation: how come you can iterate on a Node.js ReadableStream via "of" operator?
 * What's "for await"?
 * @param {fs.ReadStream} stream 
 */
async function* nodeStreamToIterator(stream) {
    for await (const chunk of stream) {
        // conversion to Uint8Array is important here otherwise the stream is not readable
        yield new Uint8Array(chunk);
    }
}

/**
 * Taken from Next.js doc
 * https://nextjs.org/docs/app/building-your-application/routing/router-handlers#streaming
 * Itself taken from mozilla doc
 * https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
 * @param {*} iterator 
 * @returns {ReadableStream}
 */
function iteratorToStream(iterator) {
    return new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next()

            if (done) {
                controller.close()
            } else {
                controller.enqueue(value)
            }
        },
    })
}

export function streamFile(path: string): ReadableStream {
    const downloadStream = fs.createReadStream(path);
    const data: ReadableStream = iteratorToStream(nodeStreamToIterator(downloadStream))
    return data
}