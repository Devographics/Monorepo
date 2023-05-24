export interface NextPageParams<TParams = any, TSearchParams = any> {
    params: Partial<TParams>
    searchParams: Partial<TSearchParams>
}