import React, { useState } from 'react'
import styled from 'styled-components'
import ModalTrigger from 'core/components/ModalTrigger'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { mq, spacing, fontSize } from 'core/theme'
import { FiltersIcon } from 'core/icons'
import isEmpty from 'lodash/isEmpty'
import Filters from './Filters'

const FiltersTrigger = props => (
    <ModalTrigger
        trigger={
            <div>
                <FiltersIcon enableTooltip={true} labelId="custom_data.customize" />
            </div>
        }
    >
        <Filters {...props} />
    </ModalTrigger>
)

export default FiltersTrigger
