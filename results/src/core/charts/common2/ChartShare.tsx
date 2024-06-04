import Button from 'core/components/Button'
import './ChartFooter.scss'
import React from 'react'
import ModalTrigger from 'core/components/ModalTrigger'
import { CommonProps } from './types'
import T from 'core/i18n/T'
import BlockShare from 'core/blocks/block/BlockShare'

export const ChartShare = ({ block, pageContext, series, variant }: CommonProps) => {
    return (
        <ModalTrigger
            trigger={
                <Button variant="link" className="chart-data">
                    <T k="charts.share" />
                </Button>
            }
        >
            <div className="chart-share-modal">
                <BlockShare block={block} />
            </div>
        </ModalTrigger>
    )
}

export default ChartShare
