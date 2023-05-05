import React from "react";
import { Entity } from "@devographics/core-models";
import { useEntities } from "~/core/components/common/EntitiesContext";

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
  entity,
  intlId,
  label,
  fallback,
}: EntityLabelProps) => {
  // const entities = useEntities();
  // const entity = entities?.find((e) => e.id === id);

  if (entity) {
    const { name, nameClean, nameHtml } = entity;
    return (
      <span
        className="entity-label"
        dangerouslySetInnerHTML={{ __html: nameHtml || nameClean }}
      />
    );
  } else if (label) {
    // if label is provided, use that
    return (
      <span
        className="entity-label entity-label-i18n"
        dangerouslySetInnerHTML={{ __html: label }}
      />
    );
  } else {
    return (
      <span className="entity-label entity-label-fallback">{fallback}</span>
    );
  }
};

export default EntityLabel;
