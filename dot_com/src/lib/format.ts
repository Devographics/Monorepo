import type { Edition, EditionStatus } from './data'

const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

/** "Oct 1 – Nov 1, 2026" */
export const formatDates = ({ startedAt, endedAt, year }: Edition) => {
    if (!startedAt || !endedAt) return String(year)
    const start = new Date(startedAt)
    const end = new Date(endedAt)
    const startYear = start.getFullYear() !== end.getFullYear() ? `, ${start.getFullYear()}` : ''
    return `${short.format(start)}${startYear} – ${short.format(end)}, ${end.getFullYear()}`
}

export const statusLabels: Record<EditionStatus, string> = {
    open: 'Open now',
    preview: 'Coming soon',
    results: 'Results out',
    closed: 'Results soon'
}

/** Where an edition's main link should point, depending on its status */
export const getEditionLink = (edition: Edition) => {
    if (edition.status === 'open' || edition.status === 'preview') {
        return { href: edition.questionsUrl, label: 'Take the survey' }
    }
    if (edition.status === 'results') {
        return { href: edition.resultsUrl, label: 'View results' }
    }
    return { href: edition.questionsUrl, label: 'View questions' }
}

/** Survey colors are used as local accents only, the page itself stays neutral */
export const getAccentStyle = (edition: Edition) =>
    edition.colors?.primary ? `--accent: ${edition.colors.primary}` : undefined
