import React from 'react'
import LayoutWrapper from 'core/layout/LayoutWrapper'
import { IdProvider } from '@radix-ui/react-id'

export const wrapPageElement = ({ element, props }) => {
    const { pageContext, ...rest } = props

    return (
        <IdProvider>
            <LayoutWrapper {...rest} pageContext={pageContext}>
                {element}
            </LayoutWrapper>
        </IdProvider>
    )
}
