/**
 * Please make sure to comment out unused blocks,
 * this is gonna help regarding bundle size.
 */

/* ---------------------------------------------------------------------- */
/* ----------------------------  Charts  -------------------------------- */
/* ---------------------------------------------------------------------- */

// generic charts
import HorizontalBarBlock2 from 'core/charts/horizontalBar2'
import { CardinalitiesBlock } from 'core/charts/cardinalities'
import VerticalBarBlock2 from 'core/charts/verticalBar2'
import PeopleBlock from 'core/charts/people'
// import ToolFeatureExperienceBlock from 'core/charts/toolFeatureExperience'
import MultiItemsExperienceBlock from 'core/charts/multiItemsExperience'
import MultiItemsRatiosBlock from 'core/charts/multiItemsRatios'

// historical trend charts
import { TimeSeriesByDateBlock } from 'core/charts/timeSeriesByDate/TimeSeriesByDateBlock'
import { RatiosByEdition } from 'core/charts/multiItemsRatios/RatiosByEdition'

// features
// import FeaturesOverviewBlock from 'core/charts/featuresOverview'

// tools
import ToolsArrowsBlock from 'core/charts/toolsArrows'
import ToolsTierListBlock from 'core/charts/toolsTierList'
// import ToolsScatterplotBlock from 'core/charts/toolsScatterplot'

// import ToolsRatiosLineChartBlock from 'core/charts/toolsRatiosLineChart'
// import ToolsRatiosRankingBlock from 'core/charts/toolsRatiosRanking'
// import ToolsSectionStreamsBlock from 'core/charts/toolsSectionStreams'
// import ToolsExperienceMarimekkoBlock from 'src/not_used/charts/toolsMarimekko'

// opinions
// import OpinionBlock from 'core/charts/opinion'

// takeaways
import TakeawaysBlock from 'core/blocks/other/TakeawaysBlock'

const chartBlocks = {
    HorizontalBarBlock2,
    CardinalitiesBlock,
    VerticalBarBlock2,
    TimeSeriesByDateBlock,
    RatiosByEdition,
    PeopleBlock,

    MultiItemsExperienceBlock,
    MultiItemsRatiosBlock,

    ToolsArrowsBlock,
    ToolsTierListBlock
}
/* ---------------------------------------------------------------------- */
/* ----------------------------  Blocks  -------------------------------- */
/* ---------------------------------------------------------------------- */

import DataExplorerBlock from 'core/explorer/DataExplorerBlock'

import TextBlock from 'core/blocks/other/TextBlock'
// import ImageBlock from 'core/blocks/other/ImageBlock'
import RecommendedResourcesBlock from 'core/blocks/other/RecommendedResourcesBlock'
import PageIntroductionBlock from 'core/blocks/other/PageIntroductionBlock'
import SurveyIntroBlock from 'core/blocks/other/SurveyIntroBlock'
import SurveyStartBlock from 'core/blocks/other/SurveyStartBlock'
import NewsletterBlock from 'core/blocks/other/NewsletterBlock'
import SponsorsBlock from 'core/blocks/other/SponsorsBlock'
import PartnersBlock from 'core/blocks/other/PartnersBlock'
import PicksBlock from 'core/blocks/other/PicksBlock'
import TranslatorsBlock from 'core/blocks/other/TranslatorsBlock'
import TshirtBlock from 'core/blocks/other/TshirtBlock'
import AwardsBlock from 'core/blocks/awards/AwardsBlock'
import ConclusionBlock from 'core/blocks/other/ConclusionBlock'
import NotFoundBlock from 'core/blocks/other/NotFoundBlock'
import CreditsBlock from 'core/blocks/other/CreditsBlock'

import HintBlock from 'core/blocks/other/HintBlock'
import AboutBlock from 'core/blocks/other/AboutBlock'
import HowToHelpBlock from 'core/blocks/other/HowToHelpBlock'
import SponsorFinishBlock from 'core/blocks/block/sponsor_chart/SponsorFinishBlock'
import LivestreamBlock from 'core/blocks/other/LivestreamBlock'

import HighlightBlock from 'core/blocks/other/HighlightBlock'

const otherBlocks = {
    PageIntroductionBlock,
    TextBlock,
    // ImageBlock,
    RecommendedResourcesBlock,
    TshirtBlock,
    SurveyIntroBlock,
    SurveyStartBlock,
    AwardsBlock,
    ConclusionBlock,
    NewsletterBlock,
    SponsorsBlock,
    PartnersBlock,
    PicksBlock,
    TranslatorsBlock,
    NotFoundBlock,
    HintBlock,
    CreditsBlock,
    AboutBlock,
    HowToHelpBlock,
    SponsorFinishBlock,
    LivestreamBlock,
    TakeawaysBlock,
    DataExplorerBlock,
    HighlightBlock
}

export default { ...chartBlocks, ...otherBlocks }
