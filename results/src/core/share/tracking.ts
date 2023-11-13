import ReactGA from 'react-ga'

const trackShare = (platform: string, trackingId: string) => () => {
    ReactGA.event({
        category: platform,
        action: trackingId ? `${trackingId} share` : `site share`,
    })
}

export default trackShare
