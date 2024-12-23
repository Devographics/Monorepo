import React from 'react'
import styled from 'styled-components'
import { usePageContext } from 'core/helpers/pageContext'
import { useI18n } from '@devographics/react-i18n'
import Link from 'core/components/LocaleLink'
import Button from 'core/components/Button'
import { spacing } from 'core/theme'

const SurveyStartBlock = () => {
    const context = usePageContext()
    const { translate } = useI18n()

    return (
        <Container className="IntroductionFooter">
            <Button
                as={Link}
                size="large"
                className="IntroductionFooter__Link--start"
                to={context?.next?.path}
            >
                {translate('results.start')} »
            </Button>
        </Container>
    )
}

const Container = styled.div`
    margin: ${spacing(2)} 0;
`

export default SurveyStartBlock
