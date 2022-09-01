import React, { PureComponent } from "react";
import PropTypes from "prop-types";

// registerSetting('logoUrl', null, 'Absolute URL for the logo image');
// registerSetting('title', 'My App', 'App title');
// registerSetting('tagline', null, 'App tagline');
// registerSetting('description');
// registerSetting('siteImage', null, 'An image used to represent the site on social media');
// registerSetting('faviconUrl', '/img/favicon.ico', 'Favicon absolute URL');

export interface HeadTagsProps {
  title: string;
  description?: string;
  /** Absolute or relative image for this page, used for Open Graph, Twitter */
  imageUrl: string;
  faviconUrl?: string;
  /** Website base URL, https://your-survey.com  (needed to compute absolute paths)*/
  siteUrl: string;
  /** Url for current page (will use siteUrl if not specified) */
  url?: string;
}
/**
 *
 * Create basic social meta tags for a page
 * (Facebook, Twitter)
 *
 * NOTE: you are responsible for wrapping those tags in
 * next/head, Helmet or whatever solution you use for
 * head tags decentralization
 *
 *
 */

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
export const computeHeadTags = ({
  title,
  description,
  siteUrl,
  faviconUrl,
  imageUrl,
  url = siteUrl,
}: HeadTagsProps) => {
  // add site url base if the image is stored locally
  let imageAbsoluteUrl;
  if (!!imageUrl && imageUrl.indexOf("//") === -1) {
    // remove starting slash from image path if needed
    if (imageUrl.charAt(0) === "/") {
      imageUrl = imageUrl.slice(1);
    }
    imageAbsoluteUrl = siteUrl + imageUrl;
  }

  return (
    <>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageAbsoluteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      {/* twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:image:src" content={imageAbsoluteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      <link rel="canonical" href={url} />
      <link
        //name="favicon"
        rel="shortcut icon"
        href={faviconUrl || "/favicon.svg"}
      />
    </>
  );
};
