export type StaticPathTuple = [string, string]

export type StaticPathTree = {
    [segment: string]: StaticPathTree
}

export const getPathSegments = (slugPath: string) => {
    const normalized = slugPath.replace(/^\/+|\/+$/g, '')
    return normalized ? normalized.split('/').filter(Boolean) : ['(index)']
}

export const buildStaticPathTree = (paths: Array<StaticPathTuple>) => {
    const grouped = new Map<string, StaticPathTree>()

    for (const [localeId, slugPath] of paths) {
        const existing = grouped.get(localeId) ?? {}
        let current = existing
        const segments = getPathSegments(slugPath)

        for (const segment of segments) {
            current[segment] = current[segment] ?? {}
            current = current[segment]
        }
        grouped.set(localeId, existing)
    }

    return grouped
}

export const formatStaticPathTree = (tree: StaticPathTree, indent = ''): string[] => {
    const lines: string[] = []
    const segments = Object.keys(tree).sort()

    segments.forEach((segment, index) => {
        const isLast = index === segments.length - 1
        const prefix = isLast ? '└── ' : '├── '
        const nextIndent = indent + (isLast ? '    ' : '│   ')

        lines.push(`${indent}${prefix}${segment}`)
        lines.push(...formatStaticPathTree(tree[segment], nextIndent))
    })

    return lines
}

export const formatStaticPathsForLog = (paths: Array<StaticPathTuple>) => {
    const staticPathTree = buildStaticPathTree(paths)
    return Array.from(staticPathTree.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .flatMap(([localeId, tree]) => [`${localeId}/`, ...formatStaticPathTree(tree)])
}
