import type { PageProps } from 'waku/router'
import {
  getAllLocales,
  getEditionId,
  getSurveyId,
  getTranslationHelpers,
  loadLocaleWithFallback,
} from '../../lib/i18n'

const SAMPLE_KEYS = [
  'general.surveys_available_languages',
  'general.results.description',
  'general.share',
] as const

export default async function LocalizedPage({
  locale: localeId,
}: PageProps<'/[locale]'>) {
  const [localeResult, allLocales] = await Promise.all([
    loadLocaleWithFallback(localeId),
    getAllLocales().catch(() => []),
  ])
  const { locale, requestedLocaleId, resolvedLocaleId, fallbackUsed, fallbackReason } = localeResult
  const { getMessage } = getTranslationHelpers(locale)

  return (
    <section>
      <h1>results-waku i18n check</h1>
      <p>survey: {getSurveyId()}</p>
      <p>edition: {getEditionId()}</p>
      <p>requested locale: {requestedLocaleId}</p>
      <p>resolved locale: {resolvedLocaleId}</p>
      <p>active path: /</p>
      {fallbackUsed ? (
        <p>fallback: enabled ({fallbackReason})</p>
      ) : (
        <p>fallback: not used</p>
      )}

      <h2>sample translations</h2>
      <ul>
        {SAMPLE_KEYS.map((key) => {
          const message = getMessage(key)
          const value = message.t || key
          return (
            <li key={key}>
              <code>{key}</code>: {value}
              {message.missing ? ' (missing)' : ''}
            </li>
          )
        })}
      </ul>

      <h2>locales</h2>
      <ul>
        {allLocales.map((item) => {
          const href = `/${item.id}`
          return (
            <li key={item.id}>
              <a href={href}>{item.label || item.id}</a> ({item.id})
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const
}
