import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'
import DataExplorer from './DataExplorer'

const DataExplorerBlock = ({ data }) => {
    console.log(data)
    return (
        <About>
            <DataExplorer data={data} />
        </About>
    )
}

const About = styled.div`
    @media ${mq.large} {
        max-width: 700px;
        margin: 0 auto;
        margin-bottom: ${spacing(4)};
    }
`

export default DataExplorerBlock
