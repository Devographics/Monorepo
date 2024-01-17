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
