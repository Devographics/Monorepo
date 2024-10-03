export const getEntityName = (entity) => {
  if (!entity) return;
  const { name, nameClean } = entity;
  return nameClean || name;
};
export const getEntityNameHtml = (entity) => {
  if (!entity) return;
  const { name, nameClean, nameHtml } = entity;
  return nameHtml || nameClean || name;
};

export const getEntityDescription = (entity) => {
  return entity.descriptionClean || entity.description;
}
export const getEntityDescriptionHtml = (entity) => {
  return entity.descriptionHtml || entity.descriptionClean || entity.description;
}