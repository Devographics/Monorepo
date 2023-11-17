import styled from 'styled-components'
import { mq } from 'core/theme'

const ButtonGroup = styled.div.attrs({
    className: 'ButtonGroup'
})`
    @media ${mq.small} {
        display: flex;
        flex-direction: row;
        justify-content: center;
        .Button {
            white-space: wrap;
        }
    }
    @media ${mq.mediumLarge} {
        display: inline-flex;
        vertical-align: middle;
    }
`

export default ButtonGroup
