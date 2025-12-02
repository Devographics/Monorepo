import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import { ChevronDownIcon } from '@devographics/icons'
import * as Accordion from '@radix-ui/react-accordion'

export const AccordionRoot = styled(Accordion.Root)`
    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: 4px;
`

const AccordionTriggerInner = ({ children, ...props }, forwardedRef) => (
    <StyledHeader>
        <StyledTrigger {...props} ref={forwardedRef}>
            {children}
            <AccordionChevron aria-hidden>
                <ChevronDownIcon />
            </AccordionChevron>
        </StyledTrigger>
    </StyledHeader>
)
export const AccordionTrigger = React.forwardRef(AccordionTriggerInner)

export const AccordionItem = styled(Accordion.Item)`
    overflow: 'hidden';
    margin-top: 1;
    border-bottom: 1px dashed ${({ theme }) => theme.colors.border};

    &:last-child {
        border-bottom: 0;
    }
`
const StyledHeader = styled(Accordion.Header)`
    /* background: ${({ theme }) => theme.colors.backgroundAlt}; */
    padding: ${spacing(0.5)};
    margin: 0;
`
const StyledTrigger = styled(Accordion.Trigger)`
    all: unset;
    font-size: ${fontSize('smallish')};
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const AccordionContentInner = ({ children, ...props }, forwardedRef) => (
    <StyledContent {...props} ref={forwardedRef}>
        <StyledContentText>{children}</StyledContentText>
    </StyledContent>
)
export const AccordionContent = React.forwardRef(AccordionContentInner)

const StyledContent = styled(Accordion.Content)`
    padding: ${spacing(0.5)};
    background: ${({ theme }) => theme.colors.backgroundAlt2};
    border-top: 1px dashed ${({ theme }) => theme.colors.border};
`
const StyledContentText = styled.div`
    font-size: ${fontSize('small')};
    p:last-child {
        margin: 0;
    }
`

const AccordionChevron = styled.span`
    display: block;
    vertical-align: middle;
    transition: transform 300ms;
    [data-state='open'] & {
        transform: rotate(180deg);
    }
    svg {
        display: block;
        vertical-align: middle;
    }
`
