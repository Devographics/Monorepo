import { Entity } from "@devographics/types";
import { T } from "@devographics/react-i18n";
import { getEntityNameHtml } from "~/lib/surveys/helpers/getEntityName";
import { EntityPopoverTrigger } from "./EntityPopover";

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
export interface EntityLabelProps extends EntityLabelDefinition, StringLabel { }

export const EntityLabel = (props: EntityLabelProps) => {
  const { entity } = props;
  return (
    <span className="entity-label-wrapper">
      <EntityLabelContents {...props} />
      {entity && entity?.example && (
        <EntityPopoverTrigger
          label={<EntityLabelContents {...props} />}
          entity={entity}
        />
      )}
    </span>
  );
};

export const EntityLabelContents = ({
  //id,
  entity,
  intlId,
  label,
  fallback,
}: EntityLabelProps) => {
  const entityName = getEntityNameHtml(entity);

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
        <T token={intlId || ""} fallback={fallback} />
      </span>
    );
  }
};

export default EntityLabel;
