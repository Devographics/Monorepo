import React from 'react'
import Button from 'core/components/Button'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import Link from 'core/components/LocaleLink'

const EssaySectionLink = ({ path, children }) => (
    <SectionLinkWrapper>
        <SectionLink as={Link} className="PageFooter__Link PageFooter__Link--next Button" to={path}>
            {children}
        </SectionLink>
    </SectionLinkWrapper>
)

const SectionLinkWrapper = styled.div`
  margin-bottom: ${spacing(2)};
  display: flex;
  justify-content: center;
`

const SectionLink = styled(Button)``

export default EssaySectionLink
