import React from 'react'
import styled from 'styled-components'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { BsTable } from 'react-icons/bs'
import { GoGraph } from 'react-icons/go'

const VisuallyHidden = styled.span`
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
`

const BlockViewSelector = ({ view, setView }) => {
    return (
        <ButtonGroup>
            <Button
                size="small"
                className={`Button--${view === 'viz' ? 'selected' : 'unselected'}`}
                onClick={() => setView('viz')}
                aria-pressed={view === 'viz'}
            >
                <GoGraph />
                <VisuallyHidden>
                    <T k="views.viz" />
                </VisuallyHidden>
            </Button>

            <Button
                size="small"
                className={`Button--${view === 'data' ? 'selected' : 'unselected'}`}
                onClick={() => setView('data')}
                aria-pressed={view === 'data'}
            >
                <BsTable />
                <VisuallyHidden>
                    <T k="views.table" />
                </VisuallyHidden>
            </Button>
        </ButtonGroup>
    )
}

export default BlockViewSelector
