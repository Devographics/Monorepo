import './CustomVariant.scss'
import { useI18n } from '@devographics/react-i18n'
import { AllQuestionData } from '@devographics/types'
import Loading from 'core/explorer/Loading'
import { DataLoaderError } from 'core/filters/dataloaders/DataLoaderError'
import {
    CreateVariantType,
    CustomVariant,
    DeleteVariantType,
    UpdateVariantType,
    fetchSeriesData,
    useDidMountEffect,
    useStickyState
} from 'core/filters/helpers'
import { DataSeries } from 'core/filters/types'
import { usePageContext } from 'core/helpers/pageContext'
import { BlockVariantDefinition } from 'core/types'
import React, { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'

export const CustomVariantWrapper = ({
    block,
    variant,
    createVariant,
    updateVariant,
    deleteVariant,
    setActiveTab,
    children
}: {
    block: BlockVariantDefinition
    variant: CustomVariant
    createVariant: CreateVariantType
    updateVariant: UpdateVariantType
    deleteVariant: DeleteVariantType
    setActiveTab: Dispatch<SetStateAction<string>>
    children: JSX.Element
}) => {
    const { getString } = useI18n()
    const [apiError, setApiError] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [series, setSeries] = useStickyState<Array<DataSeries<AllQuestionData>> | null>(
        null,
        `data-${variant.id}`
    )
    const [query, setQuery] = useState<string | undefined>()
    const pageContext = usePageContext()
    const { chartFilters } = variant
    const year = pageContext.currentEdition.year

    const getData = async () => {
        console.log('// getData')
        setIsLoading(true)
        setApiError(null)
        const {
            result: seriesData,
            error,
            query
        } = await fetchSeriesData({
            block,
            pageContext,
            chartFilters,
            year
        })
        setQuery(query)
        if (error) {
            setApiError(error)
        } else if (seriesData) {
            setSeries(seriesData)
        }
        setIsLoading(false)
    }

    // on initial render, only trigger a new query if series are empty
    useEffect(() => {
        if (!series || series.length === 0) {
            getData()
        }
    }, [])

    // on subsequent renders, trigger a new query whenever chart filters change
    useDidMountEffect(() => {
        getData()
    }, [chartFilters])

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
            {apiError ? (
                <DataLoaderError
                    block={block}
                    apiError={apiError}
                    query={query}
                    chartFilters={chartFilters}
                />
            ) : series === null || series.length === 0 || isLoading ? (
                <>
                    <div className="chart-placeholder"></div>
                    <Loading />
                </>
            ) : (
                <div className="chart-variant">
                    {React.cloneElement(children, {
                        series,
                        variant
                    })}
                </div>
            )}
        </div>
    )
}
