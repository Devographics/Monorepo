import React from 'react'
import LayoutWrapper from './src/core/layout/LayoutWrapper'

/**
 *  @typedef {{element: any,
 *              props: {
 *                  location: any
 *                  pageContext: any,
 *                  data: {allSiteFunction: any, allSitePage: any},
 *                  pageResources: any,
 *                  uri: string,
 *                  path: string,
 *                  serverData?: any,
 *                  custom404?: any,
 *                  children?: React.ReactNode
 *              }
 * }} PageElementProps
 */
/**
 * @param {PageElementProps}
 * @returns
 */
export const wrapPageElement = ({ element, props }) => {
    return <LayoutWrapper {...props}>{element}</LayoutWrapper>
}

export const onRouteUpdate = ({ location, prevLocation }) => {
    // only scroll to top if the pathname has actually changed
    // (i.e. not for internal anchor links)
    if (location?.pathname !== prevLocation?.pathname) {
        const pageContent = document.getElementById('pageContent')
        if (pageContent) {
            pageContent.scrollTop = 0
        }
    }

    // https://github.com/pixelplicity/gatsby-plugin-plausible/blob/master/src/gatsby-browser.js
    if (process.env.NODE_ENV === `production` && typeof window.plausible === `object`) {
        const pathIsExcluded =
            location &&
            typeof window.plausibleExcludePaths !== `undefined` &&
            window.plausibleExcludePaths.some(rx => rx.test(location.pathname))

        if (pathIsExcluded) return null

        window.plausible('pageview')
    }
}
