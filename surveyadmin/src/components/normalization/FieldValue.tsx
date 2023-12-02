import {
  NormalizationMetadata,
  NormalizationToken,
} from "~/lib/normalization/types";
import { escapeHTML, highlightPatterns } from "../hooks";

export const FieldValue = ({
  raw,
  tokens,
  currentTokenId,
  filterQuery,
}: {
  raw: string;
  tokens: NormalizationToken[];
  currentTokenId?: string;
  filterQuery?: string;
}) => {
  const filterQueryPattern = filterQuery && `/${filterQuery}/i`;

  const tokenPatterns = tokens?.map((t) => t.pattern) || [];
  const patterns = filterQuery
    ? [...tokenPatterns, filterQueryPattern]
    : tokenPatterns;

  const getValue = (value: string) => {
    return patterns.length > 0
      ? highlightPatterns({
          value,
          patterns,
          normalizedValue: tokens.map((t) => t.id),
          currentTokenId,
          filterQueryPattern,
        })
      : escapeHTML(value);
  };

  return (
    <div className="field-value-items">
      <blockquote>
        <span dangerouslySetInnerHTML={{ __html: getValue(raw) }} />
      </blockquote>
    </div>
  );
};

export default FieldValue;
