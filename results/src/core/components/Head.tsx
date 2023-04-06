import React from 'react'
import Helmet from 'react-helmet'
import { usePageContext } from 'core/helpers/pageContext'
import { getPageSocialMeta, getPageMeta } from 'core/helpers/pageHelpers'
import { useI18n } from 'core/i18n/i18nContext'
// import { useTools } from 'core/helpers/toolsContext'
import colors from 'core/theme/colors'

const Head = () => {
    const context = usePageContext()
    const { translate } = useI18n()
    // const { getToolName } = useTools()

    let overrides = {}
    // const toolName = getToolName(context)
    // if (toolName) {
    //     overrides.title = `${websiteTitle}: ${toolName}`
    // }

    const meta = getPageMeta(context, translate, overrides)
    const socialMeta = getPageSocialMeta(context, translate, overrides)
    const description = translate(`general.results.description`)

    const mergedMeta = [
        { charset: 'utf-8' },
        // responsive
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // google check
        {
            name: 'google-site-verification',
            content: 'hrTRsz9fkGmQlVbLBWA4wmhn0qsI6_M3NKemTGCkpps'
        },
        { name: 'custom-meta-start' },
        { name: 'description', content: description },
        // social
        ...socialMeta,
        { name: 'custom-meta-end' }
    ]

    return (
        <>
            <Helmet defaultTitle={meta.fullTitle}>
                <html lang="en" />
                <title>{meta.title}</title>
                <link rel="shortcut icon" href={context?.currentEdition?.faviconUrl} />
                <meta name="theme-color" content={colors.link} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin />
                <link
                    href="https://fonts.googleapis.com/css?family=IBM+Plex+Mono:300,300i,500,600"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
                    rel="stylesheet"
                />
                {mergedMeta.map((meta, i) => (
                    <meta {...meta} key={i} />
                ))}
            </Helmet>
        </>
    )
}

export default Head
