import toPath from "lodash/toPath.js";
import initial from "lodash/initial.js";
import flow from "lodash/fp/flow.js";
import takeRight from "lodash/takeRight.js";

/**
 * Splits a path in string format into an array.
 */
export const splitPath = (string: string) => toPath(string);

/**
 * Joins a path in array format into a string.
 */
export const joinPath = (array: Array<string | number>): string =>
  array.reduce<string>(
    (string, item) =>
      string +
      (Number.isNaN(Number(item))
        ? `${string === "" ? "" : "."}${item}`
        : `[${item}]`),
    ""
  );

/**
 * Retrieves parent path from the given one.
 *
 * @param {String} string
 *  Path in string format
 * @return {String}
 */
export const getParentPath = flow(splitPath, initial, joinPath);

/**
 * Removes prefix from the given paths.
 *
 * @param {String} prefix
 * @param {String[]} paths
 * @return {String[]}
 */
export const removePrefix = (
  prefix: string,
  paths: Array<string>
): Array<string> => {
  const explodedPrefix = splitPath(prefix);
  return paths.map((path) => {
    if (path === prefix) {
      return path;
    }
    const explodedPath = splitPath(path);
    const explodedSuffix = takeRight(
      explodedPath,
      explodedPath.length - explodedPrefix.length
    );
    return joinPath(explodedSuffix);
  });
};

/**
 * Filters paths that have the given prefix.
 *
 * @param {String} prefix
 * @param {String[]} paths
 * @return {String[]}
 */
export const filterPathsByPrefix = (prefix: string, paths: Array<string>) =>
  paths.filter(
    (path) =>
      path === prefix ||
      path.startsWith(`${prefix}.`) ||
      path.startsWith(`${prefix}[`)
  );
