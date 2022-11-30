import React, { useState, ReactNode } from 'react'
import { useTheme } from 'styled-components'
import styled from 'styled-components'
import { mq, spacing, fontSize, color } from 'core/theme'
import Button from 'core/components/Button'
import Modal from 'react-modal'
import { useI18n } from 'core/i18n/i18nContext'

type ModalTriggerProps = {
    label?: string
    trigger: ReactNode
    children: ReactNode
}

const ModalTrigger = ({ label, trigger, children }: ModalTriggerProps) => {
    const theme = useTheme()
    const [modalIsOpen, setIsOpen] = useState(false)
    const { translate } = useI18n()

    const openModal = e => {
        e && e.preventDefault()
        setIsOpen(true)
    }

    const closeModal = e => {
        e && e.preventDefault()
        setIsOpen(false)
    }

    const triggerComponent = trigger ? (
        React.cloneElement(trigger, { onClick: openModal })
    ) : (
        <TriggerDefaultComponent className="PopoverToggle" onClick={openModal}>
            {label}
        </TriggerDefaultComponent>
    )

    const childrenComponent = React.cloneElement(children, { openModal, closeModal })

    const customStyles = {
        overlay: {
            backgroundColor: `${theme.colors.background}99`,
            backdropFilter: 'blur(5px)'
        },
        content: {}
    }

    const ModalClose = ({ closeModal }) => (
        <Close onClick={closeModal} theme={theme}>
            <span aria-hidden="true">x</span>
            <span className="sr-only">{translate('share.close')}</span>
        </Close>
    )

    return (
        <>
            {triggerComponent}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel={label}
                className="ModalContent"
                // overlayClassName="ModalOverlay"
            >
                <Content>
                    <ModalClose closeModal={closeModal} />
                    <Inner>{childrenComponent}</Inner>
                </Content>
            </Modal>
        </>
    )
}

const Close = styled.button`
    display: block;
    font-size: 1.2rem;
    position: absolute;
    cursor: pointer;
    background: transparent;
    border: 2px solid transparent;
    outline: none;
    color: ${props => props.theme.colors.text};
    &:hover,
    &:focus {
        color: ${props => props.theme.colors.link};
        border-bottom: 2px solid ${props => props.theme.colors.link};
        padding-bottom: 0.15rem;
    }

    &:focus {
        border-color: ${props => props.theme.colors.link};
    }

    @media ${mq.small} {
        top: -3px;
        right: 6px;
    }
    @media ${mq.mediumLarge} {
        top: 0px;
        right: 10px;
    }
`

const Content = styled.div`
    position: absolute;
    right: auto;
    bottom: auto;

    border-width: 0;
    /* padding: 0; */
    overscroll-behavior: contain;
    border-radius: 10px;
    background: ${color('backgroundAlt')};
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.75);

    @media ${mq.small} {
        top: ${spacing(1.5)};
        left: ${spacing(1.5)};
        width: calc(100% - 60px);
    }
    @media ${mq.mediumLarge} {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: calc(100% - 40px);
        max-width: 950px;
    }
`

const Inner = styled.div`
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    @media ${mq.small} {
        padding: ${spacing()};
        max-height: calc(100vh - 60px);
    }
    @media ${mq.mediumLarge} {
        padding: ${spacing(2)};
        max-height: calc(100vh - 40px);
    }
`

const TriggerDefaultComponent = styled(Button)``

export default ModalTrigger
