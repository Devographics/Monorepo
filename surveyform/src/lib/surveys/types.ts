import { Entity, QuestionMetadata, SectionMetadata } from "@devographics/types";

export interface QuestionWithSection extends QuestionMetadata {
  section: Omit<SectionMetadata, "questions">;
}

export interface EntityWithQuestion extends Entity {
  question: QuestionWithSection;
}
