import React from 'react'
import styled, { useTheme } from 'styled-components'
import { LogoCell } from './LogoCell'

export const SidebarLogo = () => {
    const theme = useTheme()

    return (
        <Container>
            <LogoCell text="St" color={theme.colors.text} index={0} />
            <LogoCell text="Js" color={theme.colors.text} index={1} />
            <LogoCell text="20" color={theme.colors.contrast} index={2} />
            <LogoCell text="20" color={theme.colors.contrast} index={3} />
        </Container>
    )
}

const Container = styled.span`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
`

export default SidebarLogo