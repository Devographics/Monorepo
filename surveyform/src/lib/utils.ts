/**
 * Example:
 * APOLLO_SERVER_CORS_WHITELIST=http://localhost:5000,https://www.my-client.org
 * => parse the string and makes it an array
 * @param {*} variable Env array variables, with values separated by a comma (spaces allowed)
 */
export const parseEnvVariableArray = (variable = "") => {
  if (!variable) return [];
  return variable.split(",").map((s) => s.trim());
};

export const isAbsoluteUrl = (url?: string) => {
  if (!url) return false;
  return url.indexOf("//") !== -1;
};

// see https://stackoverflow.com/a/53758827

function seededRandom(seed: number) {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function hashCode(s: string) {
  let hash = 0;
  if (s.length == 0) return hash;
  for (let i = 0; i < s.length; i++) {
    let char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export function seededShuffle(array: Array<any>, seed: string) {
  let newArray = [...array],
    m = array.length,
    t,
    i;

  let numberSeed = hashCode(seed);

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(seededRandom(numberSeed) * m);
    m--;
    // And swap it with the current element.
    t = newArray[m];
    newArray[m] = newArray[i];
    newArray[i] = t;
    ++numberSeed;
  }

  return newArray;
}
