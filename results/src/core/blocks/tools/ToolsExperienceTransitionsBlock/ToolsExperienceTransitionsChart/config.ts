import { CustomSankey } from './CustomSankey'

export const staticProps = {
    layers: [CustomSankey],
    margin: {
        // space for years legends
        top: 30,
        // extra space for last year legend
        right: 10,
        // extra space for links percentage
        bottom: 10,
        // extra space for first year legend
        left: 10,
    },
    yearsLegendHeight: 30,
    yearsLegendSpacing: 26,
    // nodes below this height won't have labels
    nodeLabelMinHeight: 24,
    showLinksSilhouette: false,
}