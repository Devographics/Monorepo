import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import DataExplorer from './DataExplorer'
import { ExplorerData } from './types'

const DataExplorerBlock = ({ data }: { data: ExplorerData }) => {
    console.log(data)
    return (
        <Wrapper>
            <DataExplorer data={data} />
        </Wrapper>
    )
}

const Wrapper = styled.div`
`

export default DataExplorerBlock
