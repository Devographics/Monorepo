import React from 'react'
import Helmet from 'react-helmet'
import { usePageContext } from 'core/helpers/pageContext'
import { getPageSocialMeta, getPageMeta } from 'core/helpers/pageHelpers'
import { useI18n } from '@devographics/react-i18n'
// import { useTools } from 'core/helpers/toolsContext'
import colors from 'core/theme/colors'
import classNames from 'classnames'
import { fontList } from 'Fonts/Fonts'
import theme from 'Theme/index.ts'

const Head = () => {
    const pageContext = usePageContext()
    const { currentEdition, currentSurvey, isCapturing, isRawChartMode } = pageContext

    const { getString } = useI18n()
    // const { getToolName } = useTools()

    const overrides = {}
    // const toolName = getToolName(context)
    // if (toolName) {
    //     overrides.title = `${websiteTitle}: ${toolName}`
    // }

    const meta = getPageMeta({ pageContext, getString, overrides })
    const socialMeta = getPageSocialMeta({ pageContext, getString, overrides })
    const description = getString(`general.results.description`)?.t

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

    const bodyClassNames = classNames(
        `Page--${pageContext.id}`,
        `edition-${currentEdition.id}`,
        `survey-${currentSurvey.id}`,
        {
            capture: isCapturing,
            rawchartmode: isRawChartMode,
            nocapture: !isCapturing
        }
    )
    const faviconUrl =
        pageContext?.currentEdition?.faviconUrl ??
        `${process.env.GATSBY_ASSETS_URL}/surveys/${currentEdition.id}-favicon.png`

    const hasFonts = fontList && fontList.length > 0

    const { colors } = theme
    const variables = {
        '--textColor': colors.text,
        '--backgroundColor': colors.background,
        '--backgroundBackgroundColor': colors.backgroundBackground,
        '--backgroundAltColor': colors.backgroundAlt,
        '--borderColor': colors.border,
        '--linkColor': colors.link,
        '--spacing': `${theme.dimensions.spacing}px`
    }
    return (
        <>
            <Helmet
                defaultTitle={meta.fullTitle}
                bodyAttributes={{
                    class: bodyClassNames,
                    style: Object.keys(variables)
                        .map(name => `${name}: ${variables[name]};`)
                        .join('')
                }}
            >
                <html lang="en" />
                <title>{meta.title}</title>
                <link rel="shortcut icon" href={faviconUrl} />
                <meta name="theme-color" content={colors.link} />

                {hasFonts && <link rel="preconnect" href="https://fonts.googleapis.com" />}
                {hasFonts && (
                    <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin />
                )}
                {hasFonts &&
                    fontList.map(font => (
                        <link
                            key={font}
                            href={`https://fonts.googleapis.com/css?family=${font}`}
                            rel="stylesheet"
                        />
                    ))}

                {mergedMeta.map((meta, i) => (
                    <meta {...meta} key={i} />
                ))}
            </Helmet>
        </>
    )
}

export default Head
