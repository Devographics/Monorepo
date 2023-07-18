import { Entity, QuestionMetadata, SectionMetadata } from "@devographics/types";

export interface QuestionWithSection extends QuestionMetadata {
  section: SectionMetadata;
}

export interface EntityWithQuestion extends Entity {
  question: QuestionWithSection;
}
