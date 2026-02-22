import { getFallbackLocaleId } from '../lib/i18n'

export default async function IndexPage() {
  const localeId = getFallbackLocaleId()
  return (
    <section>
      <h1>results-waku</h1>
      <p>status: ok</p>
      <p>
        open locale page:{' '}
        <a href={`/${localeId}`}>
          /{localeId}
        </a>
      </p>
    </section>
  )
}

export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const
}
