import React, { useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'
// import '../../stylesheets/screen.scss'
// import Head from 'core/components/Head'
// import { mergePageContext } from 'core/helpers/pageHelpers'
import { I18nContextProvider } from '@devographics/react-i18n'
// import PageMetaDebug from './pages/PageMetaDebug'
// import { GlobalStyle } from 'core/theme'
// import ReportLayout from 'core/report/ReportLayout'
// import theme from 'Theme/index.ts'
import { PageContextProvider, type PageContextValue } from './PageContext'
import { KeydownContextProvider } from './KeydownContext'
import LeftMenuLayout, { tokens as LeftMenuLayoutTokens } from './LeftMenuLayout'
import { getTheme } from '@/lib/theme'
import { teapot } from '@devographics/react-i18n'

// TODO: this is an example of centralizing the tokens used by all children of ReactContextLayout
// In the future this should be built by a bundler plugin automatically
export const { tokens } = teapot(["some.value", ...LeftMenuLayoutTokens])

interface LayoutProps {
    context: any
    showPagination?: boolean
    showSidebar?: boolean
    toggleSidebar?: () => void
    closeSidebar: () => void
    children: React.ReactNode
}
/*
const ThemedLayout = (props: LayoutProps) => {
    const { colors } = theme
    const variables = {
        '--textColor': colors.text,
        '--textAltColor': colors.textAlt,
        '--backgroundColor': colors.background,
        '--backgroundBackgroundColor': colors.backgroundBackground,
        '--backgroundAltColor': colors.backgroundAlt,
        '--borderColor': colors.border,
        '--borderAltColor': colors.borderAlt,
        '--linkColor': colors.link,
        '--spacing': `${theme.dimensions.spacing}px`,
        '--halfSpacing': `${theme.dimensions.spacing / 2}px`,
        '--quarterSpacing': `${theme.dimensions.spacing / 4}px`,
        '--doubleSpacing': `${theme.dimensions.spacing * 2}px`
    }
    return (
        <ThemeProvider theme={theme}>
            GlobalStyle />
            <Head />
            <style>{`
        :root {
            background: yellow;
            ${Object.keys(variables)
                    .map(name => `${name}: ${variables[name]};`)
                    .join('')}
          }
      `}</style>
            <div>
                {props.context.id === 'report' ? (
                    <ReportLayout {...props} />
                ) : (
                    <MainLayout {...props} />
                )}
            </div>
        </ThemeProvider>
    )
}
*/

interface Dimensions {
    width: number,
    height: number
}

export function ReactContextLayout({ /*showPagination = true,*/ pageContext, children, locale }:
    {
        /*
        showPagination: boolean
        location: {
            hash: string
            host: string
            pathname: string
            href: string
            port: string
            search: string
            key: string
            protocol: string
        }*/
        pageContext: PageContextValue,
        children?: React.ReactNode,
        locale: any
    })
// { showSidebar?: boolean; width?: number; height?: number }
{

    const [{ width, height }, setDimensions] = useState<Dimensions>({ width: 0, height: 0 })
    function updateWindowDimensions() {
        const dims = { width: window.innerWidth, height: window.innerHeight }
        setDimensions(dims)
    }
    useEffect(() => {
        updateWindowDimensions()
        window.addEventListener('resize', updateWindowDimensions)
        return () => {
            window.removeEventListener('resize', updateWindowDimensions)
        }

    }, [])
    // const mergedPageContext = mergePageContext(pageContext, location, this.state)
    const mergedPageContext = pageContext
    return (
        <ThemeProvider theme={getTheme()}>
            <KeydownContextProvider>
                <PageContextProvider pageContext={mergedPageContext}>
                    {/** Locales are being fetched into "create_pages.mjs" and "locales.mjs" */}
                    <I18nContextProvider locale={locale}>
                        {/*
                    <ThemedLayout
                        context={mergedPageContext}
                        showPagination={showPagination}
                        showSidebar={showSidebar}
                        toggleSidebar={toggleSidebar}
                        closeSidebar={closeSidebar}
                    //props={this.props}
                    >
 */}
                        <LeftMenuLayout>
                            {children}
                        </LeftMenuLayout>
                        {/* </ThemedLayout> */}
                    </I18nContextProvider>
                </PageContextProvider>
            </KeydownContextProvider >
        </ThemeProvider>
    )
}
