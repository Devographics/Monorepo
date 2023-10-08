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

  if (Array.isArray(value)) {
    return (
      <div className="field-value-items">
        {value.map((v, i) => (
          <blockquote
            key={i}
            dangerouslySetInnerHTML={{
              __html: getValue(v),
            }}
          />
        ))}
      </div>
    );
  } else {
    return <span>{value}</span>;
  }
};

export default FieldValue;
