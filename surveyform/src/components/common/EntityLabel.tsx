import { Entity } from "@devographics/types";
import { T } from "@devographics/react-i18n";
import { getEntityNameHtml } from "~/lib/surveys/helpers/getEntityName";
import { EntityPopoverTrigger } from "./EntityPopover";
import BaselineLabel from "../form/BaselineLabel";

/**
 * When using an entity as the label, based on their id
 */
interface EntityLabelProps {
  id?: string;
  intlId?: string;
  fallback?: any;
  entity?: Entity;
  i18nLabel?: string;
}

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
      {entity && entity.webFeature && <BaselineLabel entity={entity} />}
    </span>
  );
};

export const EntityLabelContents = ({
  //id,
  entity,
  intlId,
  i18nLabel,
  fallback,
}: EntityLabelProps) => {
  const entityName = getEntityNameHtml(entity);

  if (i18nLabel) {
    // if label is provided, use that
    return (
      <span
        className="entity-label entity-label-i18n"
        dangerouslySetInnerHTML={{ __html: i18nLabel }}
      />
    );
  } else if (entityName) {
    return (
      <span
        className="entity-label"
        dangerouslySetInnerHTML={{ __html: entityName }}
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
