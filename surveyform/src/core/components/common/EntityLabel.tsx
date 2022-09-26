import { useVulcanComponents } from "@vulcanjs/react-ui";
import React from "react";
import { Entity } from "@devographics/core-models";

/**
 * When using a string as label
 */
interface StringLabel {
  label?: any;
}
/**
 * When using an entity as the label, based on their id
 */
interface EntityLabelDefinition {
  id?: string;
  intlId?: string;
  fallback?: any;
  entity?: Entity;
}
export interface EntityLabelProps extends EntityLabelDefinition, StringLabel {}

const EntityLabel = ({
  id,
  intlId,
  label,
  fallback,
  entity,
}: EntityLabelProps) => {
  // string label
  if (label) {
    // if label is provided, use that
    return (
      <span
        className="entity-label entity-label-i18n"
        dangerouslySetInnerHTML={{ __html: label }}
      />
    );
  } else if (entity) {
    const { name } = entity;
    return (
      <span
        className="entity-label"
        dangerouslySetInnerHTML={{ __html: name }}
      />
    );
  } else {
    return (
      <span className="entity-label entity-label-fallback">{fallback}</span>
    );
  }
};

export default EntityLabel;
