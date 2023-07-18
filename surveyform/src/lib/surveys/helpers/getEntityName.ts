export const getEntityName = (entity) => {
  if (!entity) return;
  const { name, nameClean, nameHtml } = entity;
  return nameHtml || nameClean || name;
};
