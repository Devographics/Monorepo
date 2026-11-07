import React from 'react'
import styled from 'styled-components'
import colors from '../theme/colors'
import { LogoCell } from './LogoCell'

export const SidebarLogo = () => {
    return (
        <Container>
            <LogoCell text="St" color={colors.text} index={0} />
            <LogoCell text="Js" color={colors.text} index={1} />
            <LogoCell text="20" color={colors.contrast} index={2} />
            <LogoCell text="20" color={colors.contrast} index={3} />
        </Container>
    )
}

const Container = styled.span`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
`

export default SidebarLogo