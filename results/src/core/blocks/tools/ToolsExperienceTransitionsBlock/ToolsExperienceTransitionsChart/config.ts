import { CustomSankey } from './CustomSankey'

export const staticProps = {
    layers: [CustomSankey],
    margin: {
        top: 24,
        right: 10,
        bottom: 10,
        left: 10,
    },
    yearsLegendHeight: 24,
    // nodes below this won't have labels
    nodeLabelMinHeight: 24,
    showLinksSilhouette: false,
}