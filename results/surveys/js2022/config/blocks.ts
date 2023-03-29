// generic charts
import HorizontalBarBlock from 'core/blocks/generic/HorizontalBarBlock'
import VerticalBarBlock from 'core/blocks/generic/VerticalBarBlock'
import PeopleBlock from 'core/blocks/people/PeopleBlock'

// other
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
// import ReportBlock from 'core/report/ReportBlock'
import HintBlock from 'core/blocks/other/HintBlock'
import AboutBlock from 'core/blocks/other/AboutBlock'
import HowToHelpBlock from 'core/blocks/other/HowToHelpBlock'
import SponsorFinishBlock from 'core/blocks/block/sponsor_chart/SponsorFinishBlock'
import LivestreamBlock from 'core/blocks/other/LivestreamBlock'

// data explorer
import DataExplorerBlock from 'core/blocks/explorer/DataExplorerBlock'

// demographics
import GenderBlock from 'core/blocks/demographics/GenderBlock'
import ByFacetBlock from 'core/blocks/demographics/ByFacetBlock'

// features
import FeatureExperienceBlock from 'core/blocks/features/FeatureExperienceBlock'
import FeaturesOverviewBlock from 'core/blocks/features/FeaturesOverviewBlock'
import MultiFeaturesExperienceBlock from 'core/blocks/features/MultiFeaturesExperienceBlock'

// tools
import ToolHeaderBlock from 'core/blocks/tools/ToolHeaderBlock'
import ToolExperienceBlock from 'core/blocks/tools/ToolExperienceBlock'
import ToolsSectionStreamsBlock from 'core/blocks/tools/ToolsSectionStreamsBlock'
import { ToolsExperienceRankingBlock } from 'core/blocks/tools/ToolsExperienceRankingBlock'
import { ToolsExperienceRadarBlock } from 'core/blocks/tools/ToolsExperienceRadarBlock'
import { ToolsScatterplotBlock } from 'core/blocks/tools/ToolsScatterplotBlock'
import { ToolsArrowsBlock } from 'core/blocks/tools/ToolsArrowsBlock'
import { ToolsExperienceMarimekkoBlock } from 'core/blocks/tools/ToolsExperienceMarimekkoBlock'
import { SectionToolsCardinalityByUserBlock } from 'core/blocks/tools/SectionToolsCardinalityByUserBlock'
import { AllSectionsToolsCardinalityByUserBlock } from 'core/blocks/tools/AllSectionsToolsCardinalityByUserBlock'
// import { ToolsCityscapeBlock } from 'core/blocks/tools/ToolsCityscapeBlock'
import ToolsTierListBlock from 'core/blocks/tools/ToolsTierListBlock'
import { ToolsExperienceLineChartBlock } from 'core/blocks/tools/ToolsExperienceLineChartBlock'
// import ToolExperienceGraphBlock from 'core/blocks/tools/ToolExperienceGraphBlock'
// import ToolsSectionOverviewBlock from 'core/blocks/tools/ToolsSectionOverviewBlock'
// import ToolsMatricesBlock from 'core/blocks/tools/ToolsMatricesBlock'
// import { ToolsUsageVariationsBlock } from 'core/blocks/tools/ToolsUsageVariationsBlock'

// brackets
import BracketMatchupsBlock from 'core/blocks/brackets/BracketMatchupsBlock'
import BracketWinsBlock from 'core/blocks/brackets/BracketWinsBlock'

// happiness
import { HappinessHistoryBlock } from 'core/blocks/happiness/HappinessHistoryBlock'

// opinions
import OpinionBlock from 'core/blocks/opinions/OpinionBlock'

/**
 * Please make sure to comment out unused blocks,
 * this is gonna help regarding bundle size.
 */
const blockRegistry = {
    // generic chart blocks
    HorizontalBarBlock,
    VerticalBarBlock,
    PeopleBlock,

    // other
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
    // ReportBlock,

    // explorer
    DataExplorerBlock,

    // demographics
    GenderBlock,
    ByFacetBlock,

    // features
    FeatureExperienceBlock,
    FeaturesOverviewBlock,
    MultiFeaturesExperienceBlock,

    // tools
    ToolHeaderBlock,
    ToolExperienceBlock,
    ToolsSectionStreamsBlock,
    ToolsExperienceRankingBlock,
    ToolsScatterplotBlock,
    ToolsExperienceMarimekkoBlock,
    SectionToolsCardinalityByUserBlock,
    AllSectionsToolsCardinalityByUserBlock,
    ToolsArrowsBlock,
    // ToolsCityscapeBlock,
    ToolsTierListBlock,
    ToolsExperienceRadarBlock,
    ToolsExperienceLineChartBlock,
    // ToolExperienceGraphBlock,
    // ToolsSectionOverviewBlock,
    // ToolsMatricesBlock,
    // ToolsUsageVariationsBlock,

    // brackets
    BracketMatchupsBlock,
    BracketWinsBlock,

    // happiness
    HappinessHistoryBlock,

    // opinions
    OpinionBlock
}

export default blockRegistry
