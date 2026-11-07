import React, { PureComponent } from 'react'
import propTypes from 'prop-types'
import '../../stylesheets/screen.scss'
import Head from 'core/components/Head'
import { PageContextProvider } from 'core/helpers/pageContext'
import { KeydownContextProvider } from 'core/helpers/keydownContext'
import { mergePageContext } from 'core/helpers/pageHelpers'
import { I18nContextProvider } from '@devographics/react-i18n'
// import PageMetaDebug from './pages/PageMetaDebug'
import { GlobalStyle } from 'core/theme'
import MainLayout from 'core/layout/MainLayout'
// import ReportLayout from 'core/report/ReportLayout'
import theme from 'Theme/index.ts'
import { PageContextValue } from 'core/types'
import { getThemeColor } from 'core/theme_new/colors'
import { fontSizes } from 'core/theme_new/fontSizes'
import { dimensions } from 'core/theme_new/dimensions'

interface LayoutProps {
    context: any
    showPagination?: boolean
    showSidebar?: boolean
    toggleSidebar?: () => void
    closeSidebar: () => void
    children: React.ReactNode
}
const ThemedLayout = (props: LayoutProps) => {
    const variables: Record<string, string | number> = {
        '--textColor': getThemeColor('text.default'),
        '--textColorInverted': getThemeColor('background.default'),
        '--textAltColor': getThemeColor('text.alt'),
        '--backgroundColor': getThemeColor('background.default'),
        '--backgroundAltColor': getThemeColor('background.alt'),
        '--backgroundAlt2Color': getThemeColor('background.alt2'),
        '--backgroundInvertedColor': getThemeColor('background.inverted'),
        '--borderColor': getThemeColor('border.default'),
        '--borderAltColor': getThemeColor('border.alt'),
        '--sentimentPositiveColor': getThemeColor('sentiment.positive'),
        '--sentimentNegativeColor': getThemeColor('sentiment.negative'),
        '--sentimentNeutralColor': getThemeColor('sentiment.neutral'),
        '--experienceUsedColor': getThemeColor('experience.used'),
        '--experienceHeardColor': getThemeColor('experience.heard'),
        '--experienceNeverHeardColor': getThemeColor('experience.never_heard'),
        '--linkColor': getThemeColor('primary.default'),
        '--spacing': `${dimensions.spacing}px`,
        '--halfSpacing': `${dimensions.spacing / 2}px`,
        '--quarterSpacing': `${dimensions.spacing / 4}px`,
        '--doubleSpacing': `${dimensions.spacing * 2}px`,
        '--tripleSpacing': `${dimensions.spacing * 3}px`,
        '--quadrupleSpacing': `${dimensions.spacing * 4}px`,
        '--fontFamily': theme.typography.fontFamily,
        '--secondaryFontFamily': `${theme.typography.fontFamily2}`,
        '--rootSizeMobile': theme.typography.rootSize.mobile,
        '--rootSizeDesktop': theme.typography.rootSize.desktop,
        '--fontLight': theme.typography.weight.light,
        '--fontMedium': theme.typography.weight.medium,
        '--fontBold': theme.typography.weight.bold,
        '--zIndexPopover': 5000,
        '--zIndexModal': 6000,
        '--sidebarWidth': `${dimensions.sidebarWidth}px`,
        '--border': '1px solid var(--borderColor)',
        '--separationBorder': '1px dashed var(--borderColor)',
        '--blockShadow': '0px 16px 24px rgba(0, 0, 0, 0.4), 0px 2px 6px rgba(0, 0, 0, 0.3)'
    }
    // one --fontSizeXyz variable for each shared font size
    for (const [size, value] of Object.entries(fontSizes)) {
        variables[`--fontSize${size.charAt(0).toUpperCase()}${size.slice(1)}`] = value
    }
    return (
        <>
            {/* @ts-expect-errors legacy */}
            <GlobalStyle />
            <Head />
            <style>{`
        :root {
            ${Object.keys(variables)
                .map(name => `${name}: ${variables[name]};`)
                .join('')}
          }
      `}</style>
            <div>
                {/* {props.context.id === 'report' ? (
                    <ReportLayout {...props} />
                ) : (
                    <MainLayout {...props} />
                )} */}
                <MainLayout {...props} />
            </div>
        </>
    )
}

export default class Layout extends PureComponent<
    {
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
        }
        pageContext: PageContextValue
        children?: React.ReactNode
    },
    { showSidebar?: boolean; width?: number; height?: number }
> {
    static propTypes = {
        showPagination: propTypes.bool.isRequired
    }

    static defaultProps = {
        showPagination: true
    }

    constructor(props: any) {
        super(props)
        this.state = {
            showSidebar: false
        }
    }

    componentDidMount() {
        this.updateWindowDimensions()
        window.addEventListener('resize', this.updateWindowDimensions)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions)
    }

    updateWindowDimensions = () => {
        this.setState({ width: window.innerWidth, height: window.innerHeight })
    }

    toggleSidebar = () => {
        this.setState({
            showSidebar: !this.state.showSidebar
        })
    }

    closeSidebar = () => {
        this.setState({
            showSidebar: false
        })
    }
    render() {
        const { showPagination, location, pageContext, children } = this.props
        const { showSidebar } = this.state
        const mergedPageContext = mergePageContext(pageContext, location, this.state)
        return (
            <KeydownContextProvider>
                <PageContextProvider value={mergedPageContext}>
                    {/** Locales are being fetched into "create_pages.mjs" and "locales.mjs" */}
                    <I18nContextProvider locale={mergedPageContext.locale}>
                        <ThemedLayout
                            context={mergedPageContext}
                            showPagination={showPagination}
                            showSidebar={showSidebar}
                            toggleSidebar={this.toggleSidebar}
                            closeSidebar={this.closeSidebar}
                            //props={this.props}
                        >
                            {children}
                        </ThemedLayout>
                    </I18nContextProvider>
                </PageContextProvider>
            </KeydownContextProvider>
        )
    }
}
