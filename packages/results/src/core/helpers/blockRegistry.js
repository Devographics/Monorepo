// generic charts
import HorizontalBarBlock from 'core/blocks/generic/HorizontalBarBlock'
import VerticalBarBlock from 'core/blocks/generic/VerticalBarBlock'
import HeatmapBlock from 'core/blocks/generic/HeatmapBlock'

// other
import TextBlock from 'core/blocks/other/TextBlock'
import RecommendedResourcesBlock from 'core/blocks/other/RecommendedResourcesBlock'
import PageIntroductionBlock from 'core/blocks/other/PageIntroductionBlock'
import SurveyIntroBlock from 'core/blocks/other/SurveyIntroBlock'
import NewsletterBlock from 'core/blocks/other/NewsletterBlock'
import SponsorsBlock from 'core/blocks/other/SponsorsBlock'
import PicksBlock from 'core/blocks/other/PicksBlock'
import TranslatorsBlock from 'core/blocks/other/TranslatorsBlock'
import TshirtBlock from 'core/blocks/other/TshirtBlock'
import AwardBlock from 'core/blocks/awards/AwardBlock'
import ConclusionBlock from 'core/blocks/other/ConclusionBlock'
import NotFoundBlock from 'core/blocks/other/NotFoundBlock'
// import ReportBlock from 'core/report/ReportBlock'
import HintBlock from 'core/blocks/other/HintBlock'

// demographics
import ParticipationByCountryBlock from 'core/blocks/demographics/ParticipationByCountryBlock'
import GenderBlock from 'core/blocks/demographics/GenderBlock'
import GenderByCountriesBlock from 'core/blocks/demographics/GenderByCountriesBlock'

// features
import FeatureExperienceBlock from 'core/blocks/features/FeatureExperienceBlock'
import FeaturesOverviewBlock from 'core/blocks/features/FeaturesOverviewBlock'
import KnowledgeScoreBlock from 'core/blocks/features/KnowledgeScoreBlock'

// tools
import ToolHeaderBlock from 'core/blocks/tools/ToolHeaderBlock'
import ToolExperienceBlock from 'core/blocks/tools/ToolExperienceBlock'
import ToolsSectionStreamsBlock from 'core/blocks/tools/ToolsSectionStreamsBlock'
import { ToolsExperienceRankingBlock } from 'core/blocks/tools/ToolsExperienceRankingBlock'
import ToolsScatterplotBlock from 'core/blocks/tools/ToolsScatterplotBlock'
import { ToolsArrowsBlock } from 'core/blocks/tools/ToolsArrowsBlock'
import { ToolsExperienceMarimekkoBlock } from 'core/blocks/tools/ToolsExperienceMarimekkoBlock'
import { SectionToolsCardinalityByUserBlock } from 'core/blocks/tools/SectionToolsCardinalityByUserBlock'
import { AllSectionsToolsCardinalityByUserBlock } from 'core/blocks/tools/AllSectionsToolsCardinalityByUserBlock'
import { ToolsCityscapeBlock } from 'core/blocks/tools/ToolsCityscapeBlock'
// import ToolExperienceGraphBlock from 'core/blocks/tools/ToolExperienceGraphBlock'
// import ToolsSectionOverviewBlock from 'core/blocks/tools/ToolsSectionOverviewBlock'
// import ToolsMatricesBlock from 'core/blocks/tools/ToolsMatricesBlock'
// import { ToolsUsageVariationsBlock } from 'core/blocks/tools/ToolsUsageVariationsBlock'

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
    HeatmapBlock,

    // other
    PageIntroductionBlock,
    TextBlock,
    RecommendedResourcesBlock,
    TshirtBlock,
    SurveyIntroBlock,
    AwardBlock,
    ConclusionBlock,
    NewsletterBlock,
    SponsorsBlock,
    PicksBlock,
    TranslatorsBlock,
    NotFoundBlock,
    HintBlock,
    // ReportBlock,
    
    // demographics
    ParticipationByCountryBlock,
    GenderBlock,
    GenderByCountriesBlock,

    // features
    FeatureExperienceBlock,
    FeaturesOverviewBlock,
    KnowledgeScoreBlock,

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
    ToolsCityscapeBlock,
    // ToolExperienceGraphBlock,
    // ToolsSectionOverviewBlock,
    // ToolsMatricesBlock,
    // ToolsUsageVariationsBlock,

    // happiness
    HappinessHistoryBlock,

    // opinions
    OpinionBlock,
}

export default blockRegistry
