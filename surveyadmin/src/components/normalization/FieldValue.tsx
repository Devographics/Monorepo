import { escapeHTML, highlightPatterns } from "../hooks";

export const FieldValue = ({
  value,
  normalizedValue = [],
  patterns = [],
  currentTokenId,
}: {
  value: string | string[];
  normalizedValue?: string[];
  patterns?: string[];
  currentTokenId?: string;
}) => {
  const getValue = (value: string) => {
    return patterns.length > 0 && normalizedValue.length > 0
      ? highlightPatterns({ value, patterns, normalizedValue, currentTokenId })
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
        <blockquote>{value}</blockquote>
      )}
    </div>
  );
};

export default FieldValue;
