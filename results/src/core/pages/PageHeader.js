import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { usePageContext } from '../helpers/pageContext'
import { getPageLabelKey } from '../helpers/pageHelpers'
import { mq, secondaryFontMixin, fontSize } from 'core/theme'
import T from 'core/i18n/T'

const PageHeader = () => {
    const page = usePageContext()
    return (
        <PageTitle>
            <T k={getPageLabelKey(page)} />
        </PageTitle>
    )
}

const PageTitle = styled.h2`
    ${secondaryFontMixin}
    @media ${mq.small} {
        font-size: ${fontSize('larger')};
    }
    @media ${mq.mediumLarge} {
        font-size: ${fontSize('huger')};
    }
`

PageHeader.propTypes = {
    title: PropTypes.string,
    showIntro: PropTypes.bool,
    introduction: PropTypes.node
}

export default PageHeader
