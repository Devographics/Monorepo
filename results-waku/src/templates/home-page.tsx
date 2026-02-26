import { getFallbackLocaleId } from '../lib/i18n'

export async function HomePage() {
  const localeId = getFallbackLocaleId()
  return (
    <section>
      <h1>results-waku</h1>
      <p>status: ok</p>
      <p>
        open locale page:{' '}
        <a href={`/${localeId}/`}>
          /{localeId}/
        </a>
      </p>
    </section>
  )
}
