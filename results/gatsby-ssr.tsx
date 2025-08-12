import React from 'react'
import LayoutWrapper from './src/core/layout/LayoutWrapper'

export const wrapPageElement = ({ element, props }) => {
    const { pageContext, ...rest } = props

    return (
        <LayoutWrapper {...rest} pageContext={pageContext}>
            {element}
        </LayoutWrapper>
    )
}

// https://github.com/pixelplicity/gatsby-plugin-plausible/blob/master/src/gatsby-ssr.js
const getOptions = pluginOptions => {
    const plausibleDomain = pluginOptions.customDomain || 'plausible.io'
    const scriptURI = plausibleDomain === 'plausible.io' ? '/js/plausible.js' : '/js/index.js'
    const domain = process.env.PLAUSIBLE_DOMAIN
    const excludePaths = pluginOptions.excludePaths || []
    const trackAcquisition = pluginOptions.trackAcquisition || false

    return {
        plausibleDomain,
        scriptURI,
        domain,
        excludePaths,
        trackAcquisition
    }
}

import { Minimatch } from 'minimatch'

export const onRenderBody = ({ setHeadComponents }, pluginOptions) => {
    if (process.env.NODE_ENV === 'production') {
        const { plausibleDomain, scriptURI, domain, excludePaths, trackAcquisition } =
            getOptions(pluginOptions)

        const plausibleExcludePaths = []
        excludePaths.map(exclude => {
            const mm = new Minimatch(exclude)
            plausibleExcludePaths.push(mm.makeRe())
        })
        const scriptProps = {
            async: true,
            defer: true,
            'data-domain': domain,
            // src: `https://${plausibleDomain}${scriptURI}`,
            src: 'https://plausible.io/js/script.outbound-links.tagged-events.js'
        }
        if (trackAcquisition) {
            scriptProps['data-track-acquisition'] = true
        }

        return setHeadComponents([
            <link
                key="gatsby-plugin-plausible-preconnect"
                rel="preconnect"
                href={`https://${plausibleDomain}`}
            />,
            <script key="gatsby-plugin-plausible-script" {...scriptProps}></script>,
            //See: https://docs.plausible.io/goals-and-conversions#trigger-custom-events-with-javascript
            <script
                key="gatsby-plugin-plausible-custom-events"
                dangerouslySetInnerHTML={{
                    __html: `
          window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) };
          ${excludePaths.length ? `window.plausibleExcludePaths=[${excludePaths.join(`,`)}];` : ``}
          `
                }}
            />
        ])
    }
    return null
}
