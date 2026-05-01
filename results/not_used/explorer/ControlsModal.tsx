import React, { useState } from 'react'
import styled from 'styled-components'
import Selector from './Selector'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { CommonProps } from './types'

interface ControlsModalProps extends CommonProps {
    closeModal?: any
}
// the modal handles its own internal state before updating the overall explorer state on submit
const ControlsModal = (props: ControlsModalProps) => {
    const { stateStuff, closeModal } = props
    const [xSection, setxSection] = useState(stateStuff.xSection)
    const [xField, setxField] = useState(stateStuff.xField)
    const [ySection, setySection] = useState(stateStuff.ySection)
    const [yField, setyField] = useState(stateStuff.yField)
    const [dotsPerLine, setDotsPerLine] = useState(stateStuff.dotsPerLine)
    const [respondentsPerDot, setRespondentsPerDot] = useState(stateStuff.respondentsPerDot)
    const [showCellCounts, setShowCellCounts] = useState(stateStuff.showCellCounts)
    const [showNoAnswer, setShowNoAnswer] = useState(stateStuff.showNoAnswer)

    const stateStuffOverride = {
        ...stateStuff,
        xSection,
        setxSection,
        xField,
        setxField,
        ySection,
        setySection,
        yField,
        setyField
    }

    const handleSubmit = () => {
        stateStuff.setxSection(xSection)
        stateStuff.setxField(xField)
        stateStuff.setySection(ySection)
        stateStuff.setyField(yField)
        stateStuff.setDotsPerLine(dotsPerLine)
        stateStuff.setRespondentsPerDot(respondentsPerDot)
        stateStuff.setShowCellCounts(showCellCounts)
        stateStuff.setShowNoAnswer(showNoAnswer)
        closeModal()
    }

    return (
        <ControlsModal_>
            <Form_>
                <Row_>
                    <Selector axis="x" {...props} stateStuff={stateStuffOverride} />
                </Row_>
                <Row_>
                    <Selector axis="y" {...props} stateStuff={stateStuffOverride} />
                </Row_>
                <Row_>
                    <Label_>
                        <input
                            onChange={e => {
                                const value = e.target.value
                                setRespondentsPerDot(value)
                            }}
                            size={2}
                            value={respondentsPerDot}
                        />
                        <span>
                            <T k="explorer.respondents_per_dot" />
                        </span>
                    </Label_>
                </Row_>
                <Row_>
                    <Label_>
                        <input
                            onChange={e => {
                                const value = e.target.value
                                setDotsPerLine(value)
                            }}
                            size={2}
                            value={dotsPerLine}
                        />
                        <span>
                            <T k="explorer.dots_per_line" />
                        </span>
                    </Label_>
                </Row_>
                <Row_>
                    <Label_>
                        <input
                            type="checkbox"
                            checked={showCellCounts}
                            onChange={e => {
                                setShowCellCounts(!showCellCounts)
                            }}
                        />
                        <span>
                            <T k="explorer.show_cell_counts" />
                        </span>
                    </Label_>
                </Row_>
                <Row_>
                    <Label_>
                        <input
                            type="checkbox"
                            checked={showNoAnswer}
                            onChange={e => {
                                setShowNoAnswer(!showNoAnswer)
                            }}
                        />
                        <span>
                            <T k="explorer.show_no_answer" />
                        </span>
                    </Label_>
                </Row_>
                <Button onClick={handleSubmit}>Submit</Button>
            </Form_>
        </ControlsModal_>
    )
}

const ControlsModal_ = styled.div``

const Form_ = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`

const Row_ = styled.div``

const Label_ = styled.label`
    display: flex;
    align-items: center;
    gap: 10px;
`

export default ControlsModal
