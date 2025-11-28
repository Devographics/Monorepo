import { OrderOptions } from '@devographics/types'

export type FreeformAnswersState = {
    sort: string | null
    setSort: React.Dispatch<React.SetStateAction<string | null>>
    order: OrderOptions | null
    setOrder: React.Dispatch<React.SetStateAction<OrderOptions | null>>
    keywordFilter: string | null
    setKeywordFilter: React.Dispatch<React.SetStateAction<string | null>>
    searchFilter: string | null
    setSearchFilter: React.Dispatch<React.SetStateAction<string | null>>
    tokenFilter: string | null
    setTokenFilter: React.Dispatch<React.SetStateAction<string | null>>
}
