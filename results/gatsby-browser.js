import React from 'react'
import * as ReactGA from 'react-ga'
import LayoutWrapper from 'core/layout/LayoutWrapper'
import config from 'Config/config.yml'

const { gaUAid } = config

ReactGA.initialize(gaUAid)

export const onRouteUpdate = ({ location }) => {
    ReactGA.pageview(location.pathname)
}

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
    return (
        <LayoutWrapper {...props}>
            {element}
        </LayoutWrapper>
    )
}
