import React from 'react'
import ModalTrigger from 'core/components/ModalTrigger'
import T from 'core/i18n/T'
import FiltersPanel from '../FiltersPanel'
import Button from 'core/components/Button'
import { JSONTrigger } from 'core/blocks/block/BlockData'
import styled from 'styled-components'
import { DynamicDataLoaderProps } from './DynamicDataLoader'

export const DataLoaderFooter = (props: DynamicDataLoaderProps) => {
    return (
        <Footer_ className="dataloader-footer">
            <ModalTrigger
                trigger={
                    <Button_>
                        <T k="filters.customize_chart" />
                    </Button_>
                }
            >
                <FiltersPanel {...props} />
            </ModalTrigger>
        </Footer_>
    )
}

const Footer_ = styled.section`
    margin-top: var(--spacing);
    margin-bottom: var(--doubleSpacing);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing);
`

const Button_ = styled(Button)`
    .capture & {
        display: none;
    }
`
