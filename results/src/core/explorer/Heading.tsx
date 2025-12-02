import React from 'react'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'
import ModalTrigger from 'core/components/ModalTrigger'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { HEADING_BG, AXIS_PADDING, GRID_GAP } from './constants'
import { CommonProps } from './types'
import UnitsSelector from './UnitsSelector'
import ControlsModal from './ControlsModal'
import ShareModal from './ShareModal'
import DataModal from './DataModal'
import { EditIcon } from '@devographics/icons'
import Legend from './Legend'

const Heading = (props: CommonProps) => {
    const { stateStuff } = props
    const { xAxisLabel, yAxisLabel } = stateStuff

    return (
        <Heading_ className="secondary-bg">
            <HeadingLeft_>
                {/* <Total_>
            <T k={`explorer.total_respondents`} html={true} md={true} values={{ totalCount }} />
          </Total_> */}
                <ModalTrigger
                    size="s"
                    trigger={
                        <MainHeading_>
                            <EditButton_>
                                <Title_>
                                    <T
                                        k="explorer.main_heading"
                                        values={{ xAxisLabel, yAxisLabel }}
                                        md={true}
                                        html={true}
                                    />
                                </Title_>
                                <EditIcon size="small" labelId="explorer.edit" />
                            </EditButton_>
                        </MainHeading_>
                    }
                >
                    <ControlsModal {...props} />
                </ModalTrigger>
                <Legend {...props} />
            </HeadingLeft_>
            <HeadingRight_>
                <UnitsSelector {...props} />
                <Buttons_>
                    <ModalTrigger
                        size="s"
                        trigger={
                            <Button size="small">
                                <T k="explorer.share" />
                            </Button>
                        }
                    >
                        <ShareModal {...props} />
                    </ModalTrigger>
                    <ModalTrigger
                        size="s"
                        trigger={
                            <Button size="small">
                                <T k="explorer.get_data" />
                            </Button>
                        }
                    >
                        <DataModal {...props} />
                    </ModalTrigger>
                    {/* <ModalTrigger
          size="s"
          trigger={
            <Button size="small">
              <T k="explorer.edit" />
            </Button>
          }
        >
          <ControlsModal {...props} />
        </ModalTrigger> */}
                </Buttons_>
            </HeadingRight_>
        </Heading_>
    )
}

const Heading_ = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${AXIS_PADDING}px;
    background: ${HEADING_BG};
    background: ${({ theme }) => theme.colors.backgroundAlt};
    margin-bottom: ${GRID_GAP}px;
    @media ${mq.smallMedium} {
        flex-direction: column;
        gap: ${spacing()};
        justify-content: center;
        align-items: center;
    }
    @media ${mq.large} {
        justify-content: space-between;
        align-items: center;
    }
`

const HeadingLeft_ = styled.div``

const MainHeading_ = styled.div`
    margin-bottom: 5px;
`

const Title_ = styled.h3`
    /* line-height: 1; */
    margin-bottom: 0;
`

const EditButton_ = styled(Button)`
    border-width: 0px;
    border-bottom-width: 1px;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 10px 0px;
    polygon {
        transition: all 300ms ease-out;
    }
    &:hover,
    &:focus {
        polygon {
            stroke: ${({ theme }) => theme.colors.link};
        }
    }
    cursor: pointer;
`

const HeadingRight_ = styled.div`
    padding-right: 5px;
    gap: 10px;
    display: flex;
    @media ${mq.smallMedium} {
        flex-direction: column;
        gap: ${spacing()};
        justify-content: center;
        align-items: center;
    }
    @media ${mq.large} {
        justify-content: flex-end;
        align-items: center;
    }
`

const Buttons_ = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
`

export default Heading
