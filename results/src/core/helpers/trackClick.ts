export const trackClick = (id: string, props: any) => {
    if (window && window.plausible) {
        window.plausible(id, props)
    }
}
