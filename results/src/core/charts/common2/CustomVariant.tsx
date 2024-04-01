import './CustomVariant.scss'
import { useI18n } from '@devographics/react-i18n'
import Loading from 'core/explorer/Loading'
import {
    CreateVariantType,
    CustomVariant,
    DeleteVariantType,
    UpdateVariantType
} from 'core/filters/helpers'
import { BlockDefinition } from 'core/types'
import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react'

export const CustomVariantWrapper = ({
    block,
    variant,
    createVariant,
    updateVariant,
    deleteVariant,
    setActiveTab,
    children
}: {
    block: BlockDefinition
    variant: CustomVariant
    createVariant: CreateVariantType
    updateVariant: UpdateVariantType
    deleteVariant: DeleteVariantType
    setActiveTab: Dispatch<SetStateAction<string>>
    children: ReactNode
}) => {
    const { getString } = useI18n()
    const [loading, setLoading] = useState(true)
    return (
        <div className="chart-custom-variant">
            {/* custom variant {variant.name}
            <Button
                onClick={() => {
                    if (confirm(getString('filters.delete_variant')?.t)) {
                        deleteVariant(variant.id)
                        setActiveTab(getRegularTabId(0))
                    }
                }}
            >
                Delete Variant
            </Button>
            <ModalTrigger
                trigger={
                    <div>
                        <Button>
                            <T k="filters.edit_variant" />
                        </Button>
                    </div>
                }
            >
                <FiltersPanel
                    block={block.variants[0]}
                    createVariant={createVariant}
                    updateVariant={updateVariant}
                    setActiveTab={setActiveTab}
                    variant={variant}
                />
            </ModalTrigger> */}
            {/* <div>
                <pre>
                    <code>{JSON.stringify(variant, null, 2)}</code>
                </pre>
            </div> */}
            {/* {apiError && <DataLoaderError {...loaderProps} />} */}
            {loading && <Loading />}
            <div>{children}</div>
        </div>
    )
}
