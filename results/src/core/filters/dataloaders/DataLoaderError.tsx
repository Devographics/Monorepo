import React from 'react'
import ModalTrigger from 'core/components/ModalTrigger'
import T from 'core/i18n/T'
import FiltersPanel from '../FiltersPanel'
import Button from 'core/components/Button'
import { JSONTrigger } from 'core/blocks/block/BlockData'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import { DynamicDataLoaderProps } from './DynamicDataLoader'
import newGithubIssueUrl from 'new-github-issue-url'
import { EditionMetadata } from '@devographics/types'
import { CustomizationDefinition } from '../types'
import { usePageContext } from 'core/helpers/pageContext'
import { BlockVariantDefinition } from 'core/types/index'

const getIssueReportUrl = ({
    query,
    location,
    timestamp,
    error,
    block,
    chartFilters,
    currentEdition
}: {
    query: string | undefined
    location: string
    timestamp: Date
    error: any
    block: BlockVariantDefinition
    chartFilters: CustomizationDefinition
    currentEdition: EditionMetadata
}) => {
    return newGithubIssueUrl({
        user: 'devographics',
        repo: 'monorepo',
        title: `[results/${currentEdition.id}/${block.id}] runQuery Issue: ${error.message}`,
        labels: ['runQuery issue'],
        body: `
### Edition ID

\`\`\`
${currentEdition.id}
\`\`\`

### Block ID

\`\`\`
${block.id}
\`\`\`

### Filters:

\`\`\`
${JSON.stringify(chartFilters, null, 2)}
\`\`\`

  ### Query:
  
  \`\`\`
  ${query}
  \`\`\`
  
  ### Location
  
  ${location}
  
  ### Timestamp
  
  ${timestamp.toString()}
  
  ### Error:
  
  \`\`\`
  ${JSON.stringify(error, null, 2)}
  \`\`\`
  
  `
    })
}

export const DataLoaderError = ({
    block,
    apiError,
    query,
    chartFilters
}: DynamicDataLoaderProps) => {
    const { currentEdition } = usePageContext()

    const debugInfo = {
        location: typeof window !== 'undefined' ? window?.location?.href : '',
        timestamp: new Date(),
        error: apiError,
        query,
        chartFilters,
        currentEdition,
        block
    }
    return (
        <Error_ className="dataloader-footer">
            <Contents_>
                <Heading_>
                    <T k="dataloader.failed_request" />
                </Heading_>
                <pre>
                    <code>{apiError.message}</code>
                </pre>
                <p>
                    <T k="dataloader.submit_report_prompt" />
                </p>
                <Button as="a" target="_blank" href={getIssueReportUrl(debugInfo)}>
                    <T k="dataloader.submit_issue" />
                </Button>
            </Contents_>
        </Error_>
    )
}

const Error_ = styled.section`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(6px);
    z-index: 20;
    display: grid;
    place-items: center;
`

const Contents_ = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${spacing(2)};
    & > * {
        margin: 0;
    }
    max-width: 500px;
    text-align: center;
    text-shadow: 1px 1px black;
    pre {
        background: rgba(0, 0, 0, 0.35);
        padding: ${spacing()};
        border-radius: 5px;
        box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.15);
    }
`

const Heading_ = styled.h3``
