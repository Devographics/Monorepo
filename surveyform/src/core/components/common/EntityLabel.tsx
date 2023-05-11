import React from "react";
import { Entity } from "@devographics/core-models";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

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
  intlId: string;
  fallback?: any;
  entity?: Entity;
}
export interface EntityLabelProps extends EntityLabelDefinition, StringLabel {}

const EntityLabel = ({
  //id,
  entity,
  intlId,
  label,
  fallback,
}: EntityLabelProps) => {
  if (entity) {
    const { name, nameClean, nameHtml } = entity;
    return (
      <span
        className="entity-label"
        dangerouslySetInnerHTML={{ __html: nameHtml || nameClean || name }}
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
      <span className="entity-label entity-label-fallback">
        <FormattedMessage id={intlId} defaultMessage={fallback} />
      </span>
    );
  }
};

export default EntityLabel;
