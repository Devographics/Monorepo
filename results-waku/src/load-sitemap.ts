import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const EDITIONID = process.env.EDITIONID || 'js2025'
const SERVER_DIR = dirname(fileURLToPath(import.meta.url))
const RAW_SITEMAP_PATH = resolve(SERVER_DIR, 'surveys', EDITIONID, 'config', 'raw_sitemap.yml')

export type SitemapBlock = {
    id?: string
    template?: string
    blockType?: string
    [key: string]: unknown
}

type RawSitemapPage = {
    id?: string
    path?: string
    blocks?: Array<SitemapBlock>
    children?: Array<RawSitemapPage>
}

export type SitemapPageRecord = {
    id: string
    path: string
    blocks: Array<SitemapBlock>
}

const normalizeSitemapPath = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || trimmed === '/') return '/'
    const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    const noTrailingSlash = withLeadingSlash.replace(/\/+$/g, '')
    return `${noTrailingSlash}/`
}

const joinSitemapPath = (parentPath: string, childPath: string) => {
    if (!childPath) return parentPath || '/'
    const normalizedChild = normalizeSitemapPath(childPath).replace(/^\/|\/$/g, '')
    if (!parentPath || parentPath === '/') {
        return normalizeSitemapPath(`/${normalizedChild}`)
    }
    return normalizeSitemapPath(`${parentPath.replace(/\/+$/g, '')}/${normalizedChild}`)
}

export const loadSitemap = (sitemapPath: string = RAW_SITEMAP_PATH): Array<SitemapPageRecord> => {
    if (!sitemapPath || !existsSync(sitemapPath)) {
        console.error(`raw_sitemap.yml not found at expected path: ${sitemapPath}`)
        return []
    }

    try {
        const raw = readFileSync(sitemapPath, 'utf8')
        const rawSitemap = yaml.load(raw) as Array<RawSitemapPage>
        if (!Array.isArray(rawSitemap)) return []

        const map = new Map<string, SitemapPageRecord>()

        const visit = (pages: Array<RawSitemapPage>, parentPath = '') => {
            for (const page of pages) {
                const rawPath =
                    typeof page?.path === 'string' && page.path.trim() !== ''
                        ? page.path
                        : typeof page?.id === 'string' && page.id.trim() !== ''
                        ? `/${page.id}`
                        : '/'

                const pagePath = joinSitemapPath(parentPath, rawPath)
                const pageId =
                    typeof page?.id === 'string' && page.id.trim() !== ''
                        ? page.id
                        : `page-${map.size + 1}`
                const blocks = Array.isArray(page?.blocks) ? page.blocks : []
                if (!map.has(pagePath)) {
                    map.set(pagePath, { id: pageId, path: pagePath, blocks })
                }

                if (Array.isArray(page.children) && page.children.length > 0) {
                    visit(page.children, pagePath)
                }
            }
        }

        visit(rawSitemap)
        return Array.from(map.values())
    } catch (error) {
        console.warn(
            `Failed to load raw sitemap at ${sitemapPath}:`,
            error instanceof Error ? error.message : error
        )
        console.warn(error)
        return []
    }
}

export const findSitemapPage = (sitemapPages: Array<SitemapPageRecord>, pagePath: string) =>
    sitemapPages.find(page => page.path === normalizeSitemapPath(pagePath)) ?? null
