import React from 'react'
import LayoutWrapper from 'core/layout/LayoutWrapper'

export const wrapPageElement = ({ element, props }) => {
    const { pageContext, ...rest } = props

    return (
        <LayoutWrapper {...rest} pageContext={pageContext}>
            {element}
        </LayoutWrapper>
    )
}
