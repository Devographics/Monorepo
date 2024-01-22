import React from 'react'
import PropTypes from 'prop-types'
import camelCase from 'lodash/camelCase'
import styled from 'styled-components'
import Modal from 'react-modal'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import { mq, spacing, fontSize } from 'core/theme'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import ModalTrigger from 'core/components/ModalTrigger'
import { BlockDefinition } from 'core/types'

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#___gatsby')

const ExportIcon = () => (
    <Icon
        className="mobile"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        x="0"
        y="0"
        viewBox="0 0 24 24"
    >
        <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth={1}
        >
            <path d="M20.5 23.5L3.5 23.5 3.5 0.5 14.5 0.5 20.5 6.5z"></path>
            <path d="M14.5 0.5L14.5 6.5 20.5 6.5"></path>
            <path d="M6.5 8.5H17.5V20.5H6.5z"></path>
            <path d="M6.5 11.5L17.5 11.5"></path>
            <path d="M6.5 14.5L17.5 14.5"></path>
            <path d="M6.5 17.5L17.5 17.5"></path>
            <path d="M10.5 8.5L10.5 20.5"></path>
        </g>
    </Icon>
)

const BlockExport = ({
    data,
    block,
    title
}: {
    data: any
    block: BlockDefinition
    title?: any
}) => {
    return (
        <>
            <ButtonWrapper className="BlockExport">
                <ModalTrigger
                    trigger={
                        <ExportButton className="ExportButton" size="small">
                            <T k="export.export" />
                            {/* <ExportIcon /> */}
                        </ExportButton>
                    }
                >
                    <Export block={block} data={data} title={title} />
                </ModalTrigger>
            </ButtonWrapper>
        </>
    )
}

const Export = ({ closeComponent, block, data, title }) => {
    const { id, query } = block

    const isArray = Array.isArray(data)

    // try to remove entities data
    const cleanedData = isArray
        ? data.map(row => {
              const { entity, ...rest } = row
              return rest
          })
        : data

    const jsonExport = JSON.stringify(cleanedData, '', 2)

    // remove first and last lines of query to remove "dataAPI" field
    const trimmedQuery = query && query.split('\n').slice(1, -2).join('\n')

    const graphQLExport = `query ${camelCase(id)}Query {
${trimmedQuery}
}`
    return (
        <ExportContents>
            <ExportHeading>
                <T k="export.title" values={{ title }} />
                {closeComponent}
            </ExportHeading>
            <Tabs>
                <TabList>
                    <Tab>JSON</Tab>
                    <Tab>GraphQL</Tab>
                </TabList>
                <TabPanel>
                    <Text value={jsonExport} />
                </TabPanel>
                <TabPanel>
                    <Text value={graphQLExport} />
                    <Message>
                        <T k={'export.graphql'} html={true} />
                    </Message>
                </TabPanel>
            </Tabs>
        </ExportContents>
    )
}

const Text = ({ value }) => {
    const text = React.createRef()
    const handleClick = () => {
        text.current.select()
    }
    return <TextArea value={value} readOnly ref={text} onClick={handleClick} />
}

BlockExport.propTypes = {
    id: PropTypes.string.isRequired
}

const ExportContents = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
    /* align-items: flex-start; */

    .react-tabs {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;

        .react-tabs__tab {
            &:not(.react-tabs__tab-panel--selected) {
                &:hover,
                &:focus {
                    text-decoration: underline;
                }
            }
            &:focus {
                border: 2px solid ${({ theme }) => theme.colors.text};
            }
        }
    }
    .react-tabs__tab-panel--selected {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }
    textarea {
        flex: 1;
        flex-basis: 350px;
    }

    .react-tabs__tab {
        border: 0;
        border-radius: 3px 3px 0 0;
    }

    .react-tabs__tab--selected {
        color: ${({ theme }) => theme.colors.textInverted};
    }

    .react-tabs__tab-list {
        margin: 0;
        border-bottom: 0;
    }

    .react-tabs__tab--selected {
        background: ${({ theme }) => theme.colors.backgroundInverted};
    }

    .react-tabs__tab-panel {
        background: ${({ theme }) => theme.colors.backgroundInverted};
        padding: ${spacing(0.5)};
        color: ${({ theme }) => theme.colors.textInverted};
    }

    p {
        padding: ${spacing(0.5)};
        margin: 0;
    }
`

const ExportHeading = styled.h3`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const ButtonWrapper = styled.div`
    .capture & {
        display: none;
    }
`

const ExportButton = styled(Button)`
    @media ${mq.mediumLarge} {
        margin-left: ${spacing(0.5)};
    }
`

const Icon = styled.svg`
    stroke: ${({ theme }) => theme.colors.link};
    height: 16px;
    width: 16px;

    ${ExportButton}:hover & {
        stroke: ${({ theme }) => theme.colors.contrast};
    }
`

const Message = styled.div`
    margin-top: ${spacing(0.5)};
    max-width: 600px;
    font-size: ${fontSize('small')};
`

const TextArea = styled.textarea`
    width: 100%;
    font-size: ${fontSize('small')};
    padding: ${spacing(0.5)};
    border: 0;
    border-radius: 2px;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};

    &:focus {
        outline: 0;
    }

    @media ${mq.small} {
        height: 150px;
    }
    @media ${mq.mediumLarge} {
        height: 400px;
    }
`

export default BlockExport
