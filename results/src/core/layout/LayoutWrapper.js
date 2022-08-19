import React, { PureComponent } from 'react'
import propTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'
import '../../stylesheets/screen.scss'
import Head from 'core/components/Head'
import { PageContextProvider } from 'core/helpers/pageContext'
import { KeydownContextProvider } from 'core/helpers/keydownContext'
import { mergePageContext } from 'core/helpers/pageHelpers'
import { I18nContextProvider } from 'core/i18n/i18nContext'
// import PageMetaDebug from './pages/PageMetaDebug'
import { GlobalStyle } from 'core/theme'
import MainLayout from 'core/layout/MainLayout'
import ReportLayout from 'core/report/ReportLayout'
import theme from 'Theme/index.ts'

const ThemedLayout = props => {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <Head />
            {props.context.id === 'report' ? (
                <ReportLayout {...props} />
            ) : (
                <MainLayout {...props} />
            )}
        </ThemeProvider>
    )
}

export default class Layout extends PureComponent {
    static propTypes = {
        showPagination: propTypes.bool.isRequired
    }

    static defaultProps = {
        showPagination: true
    }

    constructor() {
        super()
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
        const { showPagination, location, pageContext } = this.props
        const { showSidebar } = this.state
        const context = mergePageContext(pageContext, location, this.state)
        return (
            <KeydownContextProvider>
                <PageContextProvider value={context}>
                    <I18nContextProvider>
                        <ThemedLayout
                            context={context}
                            showPagination={showPagination}
                            showSidebar={showSidebar}
                            toggleSidebar={this.toggleSidebar}
                            closeSidebar={this.closeSidebar}
                            props={this.props}
                        />
                    </I18nContextProvider>
                </PageContextProvider>
            </KeydownContextProvider>
        )
    }
}
