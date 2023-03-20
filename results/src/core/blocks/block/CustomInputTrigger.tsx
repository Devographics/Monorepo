import React, { useState } from 'react'
import styled from 'styled-components'
import ModalTrigger from 'core/components/ModalTrigger'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import get from 'lodash/get'
import { getGraphQLQuery, AutoSelectText, TextArea, Message } from 'core/blocks/block/BlockData'
import { EditIcon } from 'core/icons'
import isEmpty from 'lodash/isEmpty'

const parseData = (block, contents) => {
    const apiDataPath = block.dataPath.replace('dataAPI', 'data')
    const customData = JSON.parse(contents)
    // const customData = {foo: 'bar'}
    const blockData = get(customData, apiDataPath) ?? customData
    return blockData
}

const InputData = ({ block, closeModal }) => {
    const textData = block.customData && JSON.stringify(block.customData, '', 2)

    const [contents, setContents] = useState(textData)
    const [error, setError] = useState()

    const handleChange = event => {
        setContents(event.target.value)
    }

    const handleClick = event => {
        if (isEmpty(contents)) {
            setError('custom_data.empty_contents')
            return
        }
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
            {error && (
                <Error>
                    <T k={error} />
                </Error>
            )}
        </div>
    )
}

const CustomInputTrigger = props => (
    <ModalTrigger
        trigger={
            <div>
                <EditIcon enableTooltip={true} labelId="custom_data.customize" />
            </div>
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

const Error = styled.p`
    color: ${({ theme }) => theme.colors.textError};
    margin-top: ${spacing()};
`
export default CustomInputTrigger
