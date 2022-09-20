/**
 * As returned by the translation API
 */
export interface RawLocale {
  id: string;
  label?: string;
  dynamic?: boolean;
  translators?: Array<string>;
  completion?: number;
  repo?: string;
  translatedCount?: number;
  totalCount?: number;
  /**
   * Loading strings is costly! Use only when necessary
   */
  strings?: Array<{ key: string; t: string }>;
}
/**
 * Parsed version used in the app
 */
export type Locale = Omit<RawLocale, "strings"> & {
  /**
   * Loading strings is costly! Use only when necessary
   */
  strings?: { [id: string]: string };
};
