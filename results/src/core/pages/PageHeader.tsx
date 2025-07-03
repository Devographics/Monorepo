import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { usePageContext } from '../helpers/pageContext'
import { getPageLabelKey } from '../helpers/pageHelpers'
import { mq, secondaryFontMixin, fontSize } from 'core/theme'
import T from 'core/i18n/T'

const PageHeader = () => {
    const pageContext = usePageContext()
    return (
        <PageTitle>
            <T k={getPageLabelKey({ pageContext })} />
        </PageTitle>
    )
}

const PageTitle = styled.h2.attrs({ className: 'PageTitle' })`
    ${secondaryFontMixin}
    line-height: 1.1;

    @media ${mq.small} {
        font-size: 3rem;
    }
    @media ${mq.mediumLarge} {
        font-size: 6rem;
    }
`

PageHeader.propTypes = {
    title: PropTypes.string,
    showIntro: PropTypes.bool,
    introduction: PropTypes.node
}

export default PageHeader
