import React, { PureComponent } from 'react'
import propTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'
import '../../stylesheets/screen.scss'
import Head from 'core/components/Head'
import { PageContextProvider } from 'core/helpers/pageContext'
import { KeydownContextProvider } from 'core/helpers/keydownContext'
import { mergePageContext } from 'core/helpers/pageHelpers'
import { I18nContextProvider } from '@devographics/react-i18n'
// import PageMetaDebug from './pages/PageMetaDebug'
import { fontSize, fontWeight, GlobalStyle } from 'core/theme'
import MainLayout from 'core/layout/MainLayout'
// import ReportLayout from 'core/report/ReportLayout'
import theme from 'Theme/index.ts'
import { PageContextValue } from 'core/types'
import { getThemeColor } from 'core/theme_new/colors'

interface LayoutProps {
    context: any
    showPagination?: boolean
    showSidebar?: boolean
    toggleSidebar?: () => void
    closeSidebar: () => void
    children: React.ReactNode
}
const ThemedLayout = (props: LayoutProps) => {
    const variables = {
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
        '--spacing': `${theme.dimensions.spacing}px`,
        '--halfSpacing': `${theme.dimensions.spacing / 2}px`,
        '--quarterSpacing': `${theme.dimensions.spacing / 4}px`,
        '--doubleSpacing': `${theme.dimensions.spacing * 2}px`,
        '--tripleSpacing': `${theme.dimensions.spacing * 3}px`,
        '--quadrupleSpacing': `${theme.dimensions.spacing * 4}px`,
        '--secondaryFontFamily': `${theme.typography.fontFamily2}`,
        '--fontLight': theme.typography.weight.light,
        '--fontMedium': theme.typography.weight.medium,
        '--fontBold': theme.typography.weight.bold,
        '--fontSizeSmaller': theme.typography.size.smaller,
        '--fontSizeSmall': theme.typography.size.small,
        '--fontSizeSmallish': theme.typography.size.smallish,
        '--fontSizeMedium': theme.typography.size.medium,
        '--fontSizeLarge': theme.typography.size.large,
        '--fontSizeLargest': theme.typography.size.largest
    }
    return (
        // @ts-expect-errors legacy
        <ThemeProvider theme={theme}>
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
        </ThemeProvider>
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
