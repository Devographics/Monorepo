// const parseBold = (s) => s.replace(/\*([^*]+)\*/g, '<b>$1</b>')

// export default parseBold

export function indentString(s: string, count = 1, options = {}) {
    const { indent = ' ', includeEmptyLines = false } = options

    if (typeof s !== 'string') {
        throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof s}\``)
    }

    if (typeof count !== 'number') {
        throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof count}\``)
    }

    if (count < 0) {
        throw new RangeError(`Expected \`count\` to be at least 0, got \`${count}\``)
    }

    if (typeof indent !== 'string') {
        throw new TypeError(
            `Expected \`options.indent\` to be a \`string\`, got \`${typeof indent}\``
        )
    }

    if (count === 0) {
        return s
    }

    const regex = includeEmptyLines ? /^/gm : /^(?!\s*$)/gm

    return s.replace(regex, indent.repeat(count))
}

export const stripHtml = s => s && s.replace(/<([^>]+?)([^>]*?)>(.*?)<\/\1>/gi, '$3')
