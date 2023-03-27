export interface HeadTagsProps {
  title: string;
  description?: string;
}
/**
 * Reusable head tags computation
 *
 * NOTE: if you want to use a value from the settings,
 * get it before calling this function and pass it as param
 *
 * Keep this function framework-agnostic
 *
 * NOTE: this is NOT a react component, because we need to avoid nesting in
 * order for next/head to work correctly
 * @see https://nextjs.org/docs/api-reference/next/head
 *
 * TODO: open source in Vulcan NPM
 */
export const computeHeadTags = ({ title, description }: HeadTagsProps) => {
  // add site url base if the image is stored locally
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {/* facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {/* twitter */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  );
};
