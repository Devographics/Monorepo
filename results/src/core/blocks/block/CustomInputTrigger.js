import React, { useState } from 'react'
import styled from 'styled-components'
import ModalTrigger from 'core/components/ModalTrigger'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import get from 'lodash/get'
import { getGraphQLQuery, AutoSelectText, TextArea, Message } from 'core/blocks/block/BlockData'
import { EditIcon } from 'core/icons'

const parseData = (block, contents) => {
    const apiDataPath = block.dataPath.replace('surveyApi', 'data')
    const customData = JSON.parse(contents)
    const blockData = get(customData, apiDataPath) ?? customData
    return blockData
}

const InputData = ({ block, closeModal }) => {
    const textData = block.customData && JSON.stringify(block.customData, '', 2)

    const [contents, setContents] = useState(textData)

    const handleChange = event => {
        setContents(event.target.value)
    }

    const handleClick = event => {
        const data = parseData(block, contents)
        block.setCustomData(data)
        closeModal()
    }

    return (
        <div>
            <TextFieldWrapper>
                <TextFieldContainer>
                    <TextFieldHeading>
                        <T k="custom_data.graphql_query" />
                    </TextFieldHeading>
                    <GraphQLTextArea value={getGraphQLQuery(block)} size="s" />
                </TextFieldContainer>
                <TextFieldContainer>
                    <TextFieldHeading>
                        <T k="custom_data.custom_data" />
                    </TextFieldHeading>
                    <DataTextArea value={contents} onChange={handleChange} size="s" />
                </TextFieldContainer>
            </TextFieldWrapper>
            <Message>
                <T k="custom_data.details" md={true} />
            </Message>
            <Button onClick={handleClick}>
                <T k="custom_data.customize" />
            </Button>
        </div>
    )
}

const CustomInputTrigger = props => (
    <ModalTrigger
        trigger={
            <TabsIcon>
                <EditIcon enableTooltip={true} labelId="custom_data.customize" />
            </TabsIcon>
        }
    >
        <InputData {...props} />
    </ModalTrigger>
)

const TextFieldWrapper = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 250px;
    column-gap: ${spacing()};
    margin-bottom: ${spacing()};
`

const TextFieldContainer = styled.div`
    display: flex;
    flex-direction: column;
`

const TextFieldHeading = styled.h3``

const DataTextArea = styled(TextArea)`
flex: 1;
`
const GraphQLTextArea = styled(AutoSelectText)`

flex: 1;
`

const TabsIcon = styled.div`
    cursor: pointer;
    padding: ${spacing(0.5)};
    margin-top: ${spacing(0.25)};
    border-radius: 3px 3px 0px 0;

    @media ${mq.mediumLarge} {
        margin-top: 0;
        margin-left: -1px;
        border-radius: 0 3px 3px 0;
        margin-bottom: ${spacing()};
        padding-left: ${spacing()};
    }
`

export default CustomInputTrigger
