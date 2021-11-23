import styled from 'styled-components'
import { mq } from 'core/theme'

const ButtonGroup = styled.div`
    @media ${mq.small} {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    @media ${mq.mediumLarge} {
        display: inline-flex;
        vertical-align: middle;
    }
`

export default ButtonGroup
