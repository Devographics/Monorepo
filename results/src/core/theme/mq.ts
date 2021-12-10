const breakpoints = {
    xSmall: 600,
    small: 600,
    medium: 1000,
    xLarge: 1200,
}

export default {
    breakpoints,
    // smaller than x-small-break
    xSmall: `screen and (max-width: ${breakpoints.xSmall - 1}px)`,
    // smaller than small-break
    small: `screen and (max-width: ${breakpoints.small - 1}px)`,
    // smaller than medium-break
    smallMedium: `screen and (max-width: ${breakpoints.medium - 1}px)`,
    // between small and medium-break
    medium: `screen and (min-width: ${breakpoints.small}px) and (max-width: ${
        breakpoints.medium - 1
    }px)`,
    // larger than small-break
    mediumLarge: `screen and (min-width: ${breakpoints.small}px)`,
    // larger than medium-break
    large: `screen and (min-width: ${breakpoints.medium}px)`,
    // larger than large-break
    xLarge: `screen and (min-width: ${breakpoints.xLarge}px)`,
}
