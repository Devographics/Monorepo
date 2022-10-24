import React, { useState } from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
import DataExplorer from './DataExplorer'
import { ExplorerData } from './types'
// import Selector from './Selector'

const DataExplorerBlock = ({ data }: { data: ExplorerData }) => {
    const [xSection, setxSection] = useState('demographics')
    const [xField, setxField] = useState('yearly_salary')
    const [ySection, setySection] = useState('demographics')
    const [yField, setyField] = useState('years_of_experience')
    const stateStuff = {
        xSection,
        setxSection,
        xField,
        setxField,
        ySection,
        setySection,
        yField,
        setyField
    }
    console.log(data)
    return (
        <Wrapper>
            <DataExplorer data={data} stateStuff={stateStuff} />
        </Wrapper>
    )
}

const Wrapper = styled.div``

export default DataExplorerBlock
