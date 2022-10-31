import React from 'react'
import styled from 'styled-components'

const UnitsSelector = ({ stateStuff }: { stateStuff: any }) => {
    const { unit, setUnit } = stateStuff
    return (
        <Wrapper_>
          <UnitsSelector_>
            <Button_
                isSelected={unit === 'count'}
                onClick={() => {
                    setUnit('count')
                }}
            >
                Count
            </Button_>
            <Button_
                isSelected={unit === 'percentage'}
                onClick={() => {
                    setUnit('percentage')
                }}
            >
                % of Row
            </Button_>
            </UnitsSelector_>
        </Wrapper_>
    )
}

const Wrapper_ = styled.div`
    /* display: grid; */
    /* place-items: center; */
    padding: 20px;
`

const UnitsSelector_ = styled.div`
    display: flex;
`

const Button_ = styled.button<{ isSelected: boolean }>`
    border: ${({ isSelected }) => (isSelected ? '2px solid white' : 'none')};
`

export default UnitsSelector
