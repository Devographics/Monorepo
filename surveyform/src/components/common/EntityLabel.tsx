import { Entity } from "@devographics/types";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getEntityName } from "~/lib/surveys/helpers/getEntityName";

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

export const EntityLabel = ({
  //id,
  entity,
  intlId,
  label,
  fallback,
}: EntityLabelProps) => {
  const entityName = getEntityName(entity);

  if (entityName) {
    return (
      <span
        className="entity-label"
        dangerouslySetInnerHTML={{ __html: entityName }}
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
        <FormattedMessage id={intlId || ""} defaultMessage={fallback} />
      </span>
    );
  }
};

export default EntityLabel;
