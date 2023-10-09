import { escapeHTML, highlightPatterns } from "../hooks";

export const FieldValue = ({
  value,
  normalizedValue = [],
  patterns: patterns_ = [],
  currentTokenId,
  filterQuery,
}: {
  value: string | string[];
  normalizedValue?: string[];
  patterns?: string[];
  currentTokenId?: string;
  filterQuery?: string;
}) => {
  const filterQueryPattern = filterQuery && `/${filterQuery}/i`;

  const patterns = filterQuery ? [...patterns_, filterQueryPattern] : patterns_;

  const getValue = (value: string) => {
    return patterns.length > 0
      ? highlightPatterns({
          value,
          patterns,
          normalizedValue,
          currentTokenId,
          filterQueryPattern,
        })
      : escapeHTML(value);
  };

  return (
    <div className="field-value-items">
      {Array.isArray(value) ? (
        value.map((v, i) => (
          <blockquote
            key={i}
            dangerouslySetInnerHTML={{
              __html: getValue(v),
            }}
          />
        ))
      ) : (
        <blockquote dangerouslySetInnerHTML={{ __html: getValue(value) }} />
      )}
    </div>
  );
};

export default FieldValue;
