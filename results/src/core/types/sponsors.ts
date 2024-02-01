
export interface SponsorProduct {
    chartId: string,
    add_to_cart_url?: string
}
export interface SponsorOrder {
    chartId: string,
    twitterName?: string,
    amount?: number
    twitterData?: {
        profile_image_url?: string,
        username?: string,
        name?: string,
    }
}