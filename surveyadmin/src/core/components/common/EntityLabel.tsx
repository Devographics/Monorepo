import { captureException } from "@sentry/nextjs";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import React from "react";
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
}
export interface EntityLabelProps extends EntityLabelDefinition, StringLabel {}

const EntityLabel = ({ id, intlId, label, fallback }: EntityLabelProps) => {
  const Components = useVulcanComponents();
  const { data, loading, error } = useEntities();
  // string label
  if (label) {
    // if label is provided, use that
    return (
      <span
        className="entity-label entity-label-i18n"
        dangerouslySetInnerHTML={{ __html: label }}
      />
    );
  }
  // entity label
  if (loading) return <Components.Loading />;
  if (error || !data) {
    console.warn(
      "No label provided and could load entities either",
      intlId,
      label,
      fallback
    );
    if (error) {
      captureException(error);
    }
    return <span className="label label-fallback">{fallback}</span>;
  }
  const { entities } = data;
  const entity = entities && entities.find((e) => e.id === id);
  if (entity) {
    const { name, isCode } = entity;
    if (isCode) {
      return <code className="entity-label entity-label-code">{name}</code>;
    } else {
      return <span className="entity-label">{name}</span>;
    }
  } else {
    return (
      <span className="entity-label entity-label-fallback">{fallback}</span>
    );
  }
};

export default EntityLabel;
