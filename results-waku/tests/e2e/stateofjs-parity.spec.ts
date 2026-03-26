import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

type ClickableKind = 'link' | 'button' | 'other'

type ClickableNode = {
  parityId: string
  kind: ClickableKind
  action: string
  x: number
  y: number
  width: number
  height: number
}

type ClickableSnapshot = {
  pageWidth: number
  pageHeight: number
  nodes: ClickableNode[]
}

type ParityTargets = {
  referenceUrl: string
  referenceOrigin: string
  localUrl: string
  localOrigin: string
}

type VisualDiff = {
  width: number
  height: number
  ratio: number
  widthDeltaRatio: number
  heightDeltaRatio: number
  diffImage: Buffer
}

const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  '[role="button"]',
  'input[type="button"]',
  'input[type="submit"]',
  '[onclick]',
  '[tabindex]:not([tabindex="-1"])',
  'summary',
].join(',')

const PARITY_PATH = normalizePath(process.env.PARITY_PATH || '/en-US/')
const LOCAL_BASE_URL = process.env.LOCAL_BASE_URL || 'http://localhost:4400'
const REFERENCE_BASE_URL = process.env.REFERENCE_BASE_URL || 'https://2025.stateofjs.com'

const MAX_PIXEL_DIFF_RATIO = parseNumberEnv('MAX_PIXEL_DIFF_RATIO', 0.03)
const MAX_DIMENSION_DELTA_RATIO = parseNumberEnv('MAX_DIMENSION_DELTA_RATIO', 0.02)
const MAX_CLICKABLE_COUNT_DELTA_RATIO = parseNumberEnv('MAX_CLICKABLE_COUNT_DELTA_RATIO', 0.15)
const MIN_CLICKABLE_GRID_OVERLAP_RATIO = parseNumberEnv('MIN_CLICKABLE_GRID_OVERLAP_RATIO', 0.65)
const MIN_LINK_ACTION_OVERLAP_RATIO = parseNumberEnv('MIN_LINK_ACTION_OVERLAP_RATIO', 0.7)
const MAX_ACTION_PROBES = parseIntEnv('MAX_ACTION_PROBES', 8)

test.describe('State of JS parity checks', () => {
  test('full-page visual snapshot is close to reference', async ({ browser }, testInfo) => {
    const targets = getTargets()
    const { referencePage, localPage, close } = await openPair(browser)
    try {
      await gotoAndStabilize(referencePage, targets.referenceUrl)
      await gotoAndStabilize(localPage, targets.localUrl)

      const referenceScreenshot = await referencePage.screenshot({
        fullPage: true,
        animations: 'disabled',
      })
      const localScreenshot = await localPage.screenshot({
        fullPage: true,
        animations: 'disabled',
      })

      await attachPng(testInfo, 'reference-fullpage', referenceScreenshot)
      await attachPng(testInfo, 'local-fullpage', localScreenshot)

      const diff = createVisualDiff(referenceScreenshot, localScreenshot)
      await attachPng(testInfo, 'visual-diff', diff.diffImage)

      expect(diff.widthDeltaRatio).toBeLessThanOrEqual(MAX_DIMENSION_DELTA_RATIO)
      expect(diff.heightDeltaRatio).toBeLessThanOrEqual(MAX_DIMENSION_DELTA_RATIO)
      expect(diff.ratio).toBeLessThanOrEqual(MAX_PIXEL_DIFF_RATIO)
    } finally {
      await close()
    }
  })

  test('clickable regions and action map align with reference', async ({ browser }, testInfo) => {
    const targets = getTargets()
    const { referencePage, localPage, close } = await openPair(browser)
    try {
      await gotoAndStabilize(referencePage, targets.referenceUrl)
      await gotoAndStabilize(localPage, targets.localUrl)

      const referenceSnapshot = await collectClickableSnapshot(referencePage, targets.referenceOrigin)
      const localSnapshot = await collectClickableSnapshot(localPage, targets.localOrigin)

      await attachJson(testInfo, 'reference-clickables', referenceSnapshot)
      await attachJson(testInfo, 'local-clickables', localSnapshot)

      const clickableCountDelta = ratioDelta(referenceSnapshot.nodes.length, localSnapshot.nodes.length)
      const clickableGridOverlap = clickableGridOverlapRatio(referenceSnapshot, localSnapshot)
      const linkActionOverlap = linkActionOverlapRatio(referenceSnapshot, localSnapshot)

      expect(clickableCountDelta).toBeLessThanOrEqual(MAX_CLICKABLE_COUNT_DELTA_RATIO)
      expect(clickableGridOverlap).toBeGreaterThanOrEqual(MIN_CLICKABLE_GRID_OVERLAP_RATIO)
      expect(linkActionOverlap).toBeGreaterThanOrEqual(MIN_LINK_ACTION_OVERLAP_RATIO)
    } finally {
      await close()
    }
  })

  test('shared clickable actions execute to the same destination', async ({ browser }, testInfo) => {
    const targets = getTargets()
    const { referencePage, localPage, close } = await openPair(browser)
    try {
      await gotoAndStabilize(referencePage, targets.referenceUrl)
      await gotoAndStabilize(localPage, targets.localUrl)

      const referenceSnapshot = await collectClickableSnapshot(referencePage, targets.referenceOrigin)
      const localSnapshot = await collectClickableSnapshot(localPage, targets.localOrigin)
      const sharedActions = findSharedProbeActions(referenceSnapshot, localSnapshot, MAX_ACTION_PROBES)

      expect(sharedActions.length).toBeGreaterThan(0)

      const mismatches: string[] = []
      for (const action of sharedActions) {
        const referenceOutcome = await probeActionOutcome({
          page: referencePage,
          targetUrl: targets.referenceUrl,
          pageOrigin: targets.referenceOrigin,
          action,
        })
        const localOutcome = await probeActionOutcome({
          page: localPage,
          targetUrl: targets.localUrl,
          pageOrigin: targets.localOrigin,
          action,
        })
        if (referenceOutcome !== localOutcome) {
          mismatches.push(`action=${action} reference=${referenceOutcome} local=${localOutcome}`)
        }
      }

      await attachJson(testInfo, 'shared-actions', { sharedActions, mismatches })
      expect(mismatches).toEqual([])
    } finally {
      await close()
    }
  })
})

const getTargets = (): ParityTargets => {
  const referenceUrl = new URL(PARITY_PATH, ensureBaseUrl(REFERENCE_BASE_URL)).toString()
  const localUrl = new URL(PARITY_PATH, ensureBaseUrl(LOCAL_BASE_URL)).toString()

  return {
    referenceUrl,
    referenceOrigin: new URL(referenceUrl).origin,
    localUrl,
    localOrigin: new URL(localUrl).origin,
  }
}

const openPair = async (browser: Browser) => {
  const contextOptions = {
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    colorScheme: 'light' as const,
    serviceWorkers: 'block' as const,
  }

  const referenceContext = await browser.newContext(contextOptions)
  const localContext = await browser.newContext(contextOptions)
  const referencePage = await referenceContext.newPage()
  const localPage = await localContext.newPage()

  return {
    referencePage,
    localPage,
    close: async () => {
      await Promise.all([referenceContext.close(), localContext.close()])
    },
  }
}

const gotoAndStabilize = async (page: Page, url: string) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => undefined)
  await page.evaluate(async () => {
    const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts
    if (fonts?.ready) {
      await fonts.ready.catch(() => undefined)
    }
  })
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
    `,
  })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
}

const collectClickableSnapshot = async (
  page: Page,
  origin: string
): Promise<ClickableSnapshot> =>
  page.evaluate(
    ({ selector, sameOrigin }) => {
      const pageWidth = Math.max(
        document.documentElement.scrollWidth,
        document.documentElement.clientWidth,
        window.innerWidth
      )
      const pageHeight = Math.max(
        document.documentElement.scrollHeight,
        document.documentElement.clientHeight,
        window.innerHeight
      )

      const clamp = (value: number) => Math.min(1, Math.max(0, value))

      const normalizeUrl = (raw: string) => {
        if (!raw) {
          return ''
        }
        try {
          const parsed = new URL(raw, window.location.href)
          if (parsed.origin === sameOrigin) {
            return `${parsed.pathname}${parsed.search}${parsed.hash}`
          }
          return parsed.toString()
        } catch {
          return raw
        }
      }

      const isVisible = (element: Element, rect: DOMRect) => {
        if (rect.width < 8 || rect.height < 8) {
          return false
        }
        const style = window.getComputedStyle(element)
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          Number.parseFloat(style.opacity || '1') < 0.05
        ) {
          return false
        }
        return true
      }

      const getKind = (element: Element): ClickableKind => {
        if (element.tagName === 'A') {
          return 'link'
        }
        if (
          element.tagName === 'BUTTON' ||
          (element instanceof HTMLInputElement &&
            (element.type === 'button' || element.type === 'submit')) ||
          element.getAttribute('role') === 'button'
        ) {
          return 'button'
        }
        return 'other'
      }

      const getAction = (element: Element, kind: ClickableKind) => {
        if (kind === 'link' && element instanceof HTMLAnchorElement) {
          return normalizeUrl(element.getAttribute('href') || element.href || '')
        }
        if (element instanceof HTMLButtonElement) {
          const formAction = normalizeUrl(element.formAction || element.getAttribute('formaction') || '')
          return `button:${element.type || 'button'}:${formAction}`
        }
        if (element instanceof HTMLInputElement) {
          const formAction = normalizeUrl(element.formAction || element.getAttribute('formaction') || '')
          return `input:${element.type || 'button'}:${formAction}`
        }
        const role = element.getAttribute('role') || ''
        const onclick = element.hasAttribute('onclick') ? 'onclick' : 'passive'
        return `interactive:${role}:${onclick}`
      }

      const nodes: ClickableNode[] = []
      let index = 0
      const elements = Array.from(document.querySelectorAll(selector))
      for (const element of elements) {
        const parentInteractive = element.parentElement?.closest(selector)
        if (parentInteractive) {
          continue
        }
        const rect = element.getBoundingClientRect()
        if (!isVisible(element, rect)) {
          continue
        }
        const parityId = `parity-${index}`
        index += 1
        element.setAttribute('data-parity-id', parityId)
        const pageX = rect.left + window.scrollX
        const pageY = rect.top + window.scrollY
        const kind = getKind(element)
        nodes.push({
          parityId,
          kind,
          action: getAction(element, kind),
          x: clamp(pageX / pageWidth),
          y: clamp(pageY / pageHeight),
          width: clamp(rect.width / pageWidth),
          height: clamp(rect.height / pageHeight),
        })
      }

      return {
        pageWidth,
        pageHeight,
        nodes,
      }
    },
    { selector: INTERACTIVE_SELECTOR, sameOrigin: origin }
  )

const createVisualDiff = (reference: Buffer, local: Buffer): VisualDiff => {
  const referencePng = PNG.sync.read(reference)
  const localPng = PNG.sync.read(local)

  const minWidth = Math.min(referencePng.width, localPng.width)
  const minHeight = Math.min(referencePng.height, localPng.height)

  const widthDeltaRatio = ratioDelta(referencePng.width, localPng.width)
  const heightDeltaRatio = ratioDelta(referencePng.height, localPng.height)

  const referenceCropped = cropPng(referencePng, minWidth, minHeight)
  const localCropped = cropPng(localPng, minWidth, minHeight)
  const diff = new PNG({ width: minWidth, height: minHeight })

  const diffPixels = pixelmatch(
    referenceCropped.data,
    localCropped.data,
    diff.data,
    minWidth,
    minHeight,
    { threshold: 0.1 }
  )
  const ratio = diffPixels / (minWidth * minHeight)

  return {
    width: minWidth,
    height: minHeight,
    ratio,
    widthDeltaRatio,
    heightDeltaRatio,
    diffImage: PNG.sync.write(diff),
  }
}

const cropPng = (png: PNG, width: number, height: number) => {
  if (png.width === width && png.height === height) {
    return png
  }
  const next = new PNG({ width, height })
  for (let y = 0; y < height; y += 1) {
    const srcOffset = y * png.width * 4
    const destOffset = y * width * 4
    png.data.copy(next.data, destOffset, srcOffset, srcOffset + width * 4)
  }
  return next
}

const clickableGridOverlapRatio = (reference: ClickableSnapshot, local: ClickableSnapshot) => {
  const referenceGrid = buildCoverageGrid(reference.nodes)
  const localGrid = buildCoverageGrid(local.nodes)
  return overlapRatio(referenceGrid, localGrid)
}

const buildCoverageGrid = (nodes: ClickableNode[]) => {
  const rows = 28
  const cols = 18
  const cells = new Set<string>()

  for (const node of nodes) {
    const minRow = clampGrid(Math.floor(node.y * rows), rows)
    const maxRow = clampGrid(Math.floor((node.y + node.height) * rows), rows)
    const minCol = clampGrid(Math.floor(node.x * cols), cols)
    const maxCol = clampGrid(Math.floor((node.x + node.width) * cols), cols)

    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        cells.add(`${row}:${col}`)
      }
    }
  }

  return cells
}

const clampGrid = (value: number, size: number) => Math.max(0, Math.min(size - 1, value))

const linkActionOverlapRatio = (reference: ClickableSnapshot, local: ClickableSnapshot) => {
  const referenceActions = new Set(reference.nodes.filter(isLinkAction).map((node) => node.action))
  const localActions = new Set(local.nodes.filter(isLinkAction).map((node) => node.action))
  return overlapRatio(referenceActions, localActions)
}

const overlapRatio = (left: Set<string>, right: Set<string>) => {
  if (!left.size && !right.size) {
    return 1
  }
  const union = new Set([...left, ...right])
  let matches = 0
  for (const value of left) {
    if (right.has(value)) {
      matches += 1
    }
  }
  return union.size ? matches / union.size : 0
}

const findSharedProbeActions = (
  reference: ClickableSnapshot,
  local: ClickableSnapshot,
  limit: number
) => {
  const localActionSet = new Set(local.nodes.filter(isLinkAction).map((node) => node.action))
  const seen = new Set<string>()
  const shared: string[] = []

  for (const node of reference.nodes) {
    if (!isLinkAction(node)) {
      continue
    }
    if (!isProbeAction(node.action)) {
      continue
    }
    if (!localActionSet.has(node.action) || seen.has(node.action)) {
      continue
    }
    shared.push(node.action)
    seen.add(node.action)
    if (shared.length >= limit) {
      break
    }
  }

  return shared
}

const isLinkAction = (node: ClickableNode) => node.kind === 'link' && Boolean(node.action)

const isProbeAction = (action: string) =>
  action.startsWith('/') &&
  !action.startsWith('/api/') &&
  !action.endsWith('.json') &&
  !action.includes('/graphql')

const probeActionOutcome = async ({
  page,
  targetUrl,
  pageOrigin,
  action,
}: {
  page: Page
  targetUrl: string
  pageOrigin: string
  action: string
}) => {
  await gotoAndStabilize(page, targetUrl)
  const snapshot = await collectClickableSnapshot(page, pageOrigin)
  const node = snapshot.nodes.find((candidate) => candidate.kind === 'link' && candidate.action === action)
  if (!node) {
    throw new Error(`Missing action "${action}" on ${targetUrl}`)
  }

  const locator = page.locator(`[data-parity-id="${node.parityId}"]`).first()
  await expect(locator).toBeVisible()
  await locator.scrollIntoViewIfNeeded()

  const popupPromise = page.waitForEvent('popup', { timeout: 2_000 }).catch(() => null)
  const before = normalizePageUrl(page.url(), pageOrigin)
  await locator.click({ timeout: 15_000 })

  const popup = await popupPromise
  if (popup) {
    await popup.waitForLoadState('domcontentloaded', { timeout: 10_000 }).catch(() => undefined)
    const popupUrl = normalizePageUrl(popup.url(), pageOrigin)
    await popup.close()
    return `popup:${popupUrl}`
  }

  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined)
  await page.waitForTimeout(200)
  const after = normalizePageUrl(page.url(), pageOrigin)
  return after === before ? `same:${after}` : after
}

const normalizePageUrl = (rawUrl: string, sameOrigin: string) => {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.origin === sameOrigin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`
    }
    return parsed.toString()
  } catch {
    return rawUrl
  }
}

const ratioDelta = (left: number, right: number) =>
  Math.abs(left - right) / Math.max(1, left, right)

function ensureBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
}

function normalizePath(rawPath: string) {
  const next = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  return next.endsWith('/') ? next : `${next}/`
}

function parseNumberEnv(key: string, fallback: number) {
  const raw = process.env[key]
  if (!raw) {
    return fallback
  }
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseIntEnv(key: string, fallback: number) {
  const raw = process.env[key]
  if (!raw) {
    return fallback
  }
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const attachPng = (testInfo: TestInfo, name: string, body: Buffer) =>
  testInfo.attach(name, { body, contentType: 'image/png' })

const attachJson = (testInfo: TestInfo, name: string, value: unknown) =>
  testInfo.attach(name, {
    body: Buffer.from(JSON.stringify(value, null, 2), 'utf-8'),
    contentType: 'application/json',
  })
