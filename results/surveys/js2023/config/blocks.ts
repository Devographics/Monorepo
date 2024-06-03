/**
 * Please make sure to comment out unused blocks,
 * this is gonna help regarding bundle size.
 */

/* ---------------------------------------------------------------------- */
/* ----------------------------  Charts  -------------------------------- */
/* ---------------------------------------------------------------------- */

// generic charts
import HorizontalBarBlock from 'core/charts/horizontalBar/index'
import HorizontalBarBlock2 from 'core/charts/horizontalBar2'
import VerticalBarBlock from 'core/charts/verticalBar'
import VerticalBarBlock2 from 'core/charts/verticalBar2'
import PeopleBlock from 'core/charts/people'
import ToolFeatureExperienceBlock from 'core/charts/toolFeatureExperience'
import MultiItemsExperienceBlock from 'core/charts/multiItemsExperience'
import MultiItemsRatiosBlock from 'core/charts/multiItemsRatios'

// features
import FeaturesOverviewBlock from 'core/charts/featuresOverview'

// tools
import ToolsArrowsBlock from 'core/charts/toolsArrows'
import ToolsTierListBlock from 'core/charts/toolsTierList'
import ToolsScatterplotBlock from 'core/charts/toolsScatterplot'

import ToolsRatiosLineChartBlock from 'core/charts/toolsRatiosLineChart'
import ToolsRatiosRankingBlock from 'core/charts/toolsRatiosRanking'
import ToolsSectionStreamsBlock from 'core/charts/toolsSectionStreams'
import ToolsExperienceMarimekkoBlock from 'core/charts/toolsMarimekko'

// opinions
import OpinionBlock from 'core/charts/opinion'

// takeaways
import TakeawaysBlock from 'core/blocks/other/TakeawaysBlock.tsx'

const chartBlocks = {
    HorizontalBarBlock,
    HorizontalBarBlock2,
    VerticalBarBlock,
    VerticalBarBlock2,
    PeopleBlock,

    MultiItemsExperienceBlock,
    MultiItemsRatiosBlock,

    ToolFeatureExperienceBlock,

    FeaturesOverviewBlock,

    ToolsArrowsBlock,
    ToolsTierListBlock,
    ToolsScatterplotBlock,

    ToolsRatiosLineChartBlock,
    ToolsRatiosRankingBlock,
    ToolsSectionStreamsBlock,
    ToolsExperienceMarimekkoBlock,

    OpinionBlock
}
/* ---------------------------------------------------------------------- */
/* ----------------------------  Blocks  -------------------------------- */
/* ---------------------------------------------------------------------- */

import DataExplorerBlock from 'core/explorer/DataExplorerBlock'

import TextBlock from 'core/blocks/other/TextBlock'
import RecommendedResourcesBlock from 'core/blocks/other/RecommendedResourcesBlock'
import PageIntroductionBlock from 'core/blocks/other/PageIntroductionBlock'
import SurveyIntroBlock from 'core/blocks/other/SurveyIntroBlock'
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

const otherBlocks = {
    PageIntroductionBlock,
    TextBlock,
    RecommendedResourcesBlock,
    TshirtBlock,
    SurveyIntroBlock,
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
    DataExplorerBlock
}

export default { ...chartBlocks, ...otherBlocks }
