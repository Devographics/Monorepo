import React, { useState } from 'react'
import styled from 'styled-components'
import { spacing } from 'core/theme'
import T from 'core/i18n/T'
import { EditIcon } from 'core/icons'
import Button from 'core/components/Button'

const EditInline = ({ defaultValue }: { defaultValue: string }) => {
    const [isTextfield, setIsTextfield] = useState(false)
    // Tracking the state with a controlled input allows for an optimistic behaviour,
    // we don't need "defaultValue" to update
    // TODO: it should probably be called "initialValue" or "currentValue" instead
    const [contents, setContents] = useState(defaultValue)
    return (
        <div>
            {isTextfield ? (
                <Wrapper>
                    <Input
                        value={contents}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setContents(e.target.value)
                        }}
                    />
                    <Button
                        onClick={() => {
                            setIsTextfield(false)
                        }}
                        size="small"
                    >
                        <T k="custom_data.submit" />
                    </Button>
                </Wrapper>
            ) : (
                <WrapperButton
                    onClick={() => {
                        setIsTextfield(true)
                    }}
                >
                    <Contents>{contents}</Contents>
                    <IconWrapper>
                        <EditIcon size="small" labelId="custom_data.edit_title" />
                    </IconWrapper>
                </WrapperButton>
            )}
        </div>
    )
}

const Wrapper = styled.form`
    display: flex;
    align-items: center;
`

const WrapperButton = styled(Wrapper)`
    cursor: pointer;
`

const Input = styled.input`
    margin-right: ${spacing(0.25)};
    padding: 3px 8px;
`

const Contents = styled.span`
    margin-right: ${spacing(0.25)};
`

const IconWrapper = styled.span`
    opacity: 0.4;
`

export default EditInline
