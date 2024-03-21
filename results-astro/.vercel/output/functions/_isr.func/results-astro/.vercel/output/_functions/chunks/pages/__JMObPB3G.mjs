import require$$0 from 'events';
import { c as createAstro, d as createComponent, r as renderTemplate, e as addAttribute, f as renderHead, g as renderSlot, m as maybeRenderHead, h as commonjsGlobal, i as getDefaultExportFromCjs, u as unescapeHTML, j as renderComponent } from '../astro_BO0LHhdo.mjs';
/* empty css                           */
import { z } from 'zod';

const $$Astro$4 = createAstro();
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description" content="Astro description"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title}</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/home/eric-burel/code-ssd/devographics/monorepo/results-astro/src/layouts/Layout.astro", void 0);

const $$Astro$3 = createAstro();
const $$Card = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Card;
  const { href, title, body } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<li class="link-card" data-astro-cid-dohjnao5> <a${addAttribute(href, "href")} data-astro-cid-dohjnao5> <h2 data-astro-cid-dohjnao5> ${title} <span data-astro-cid-dohjnao5>&rarr;</span> </h2> <p data-astro-cid-dohjnao5> ${body} </p> </a> </li> `;
}, "/home/eric-burel/code-ssd/devographics/monorepo/results-astro/src/components/Card.astro", void 0);

var data = [ { id:"APP_NAME",
    description:"Name of the app",
    example:"surveyform, api, results, surveyadmin",
    usedBy:[ "api",
      "results",
      "surveyform",
      "surveyadmin",
      "homepage",
      "charts" ] },
  { id:"API_URL",
    aliases:[ "REACT_APP_API_URL",
      "GATSBY_API_URL" ],
    description:"URL of the API",
    example:"https://api.devographics.com",
    usedBy:[ "results",
      "results-astro",
      "graphiql",
      "surveyform",
      "surveyadmin",
      "homepage",
      "charts" ] },
  { id:"API_URL_PRODUCTION",
    optional:true,
    description:"URL of the production API (so the admin area can handle it when running locally)",
    example:"https://api.devographics.com",
    usedBy:[ "surveyadmin" ] },
  { id:"APP_URL",
    aliases:[ "NEXT_PUBLIC_APP_URL" ],
    description:"Full URL the app is running on",
    example:"https://survey.devographics.com",
    usedBy:[ "surveyform" ] },
  { id:"NODE_ENV",
    aliases:[ "NEXT_PUBLIC_NODE_ENV" ],
    description:"Environment the app is running in",
    example:"production",
    usedBy:[ "surveyform" ] },
  { id:"MONGO_PRIVATE_URI",
    description:"URI of the private Mongo database",
    example:"mongodb+srv://surveys:password@foobar.fnzofph.mongodb.net/private_data",
    usedBy:[ "surveyform",
      "surveyadmin" ] },
  { id:"MONGO_PUBLIC_URI",
    description:"URI of the public Mongo database",
    example:"mongodb+srv://surveys:password@foobar.fnzofph.mongodb.net/public_data",
    usedBy:[ "surveyadmin",
      "api" ] },
  { id:"MONGO_PUBLIC_URI_READONLY",
    optional:true,
    description:"URI of the public Mongo database, read-only access",
    example:"mongodb+srv://surveys:password@foobar.fnzofph.mongodb.net/public_data",
    usedBy:[ "surveyadmin" ] },
  { id:"MONGO_PRIVATE_DB",
    description:"Name of the database where private data is stored",
    example:"private_data",
    usedBy:[ "surveyform",
      "surveyadmin" ] },
  { id:"MONGO_PUBLIC_DB",
    description:"Name of the database where public data is stored",
    example:"public_data",
    usedBy:[ "api",
      "surveyadmin" ] },
  { id:"REDIS_URL",
    description:"URL of the Redis database (using HTTP protocol for serverless)",
    example:"rediss://red-foo:foobar@oregon-redis.render.com:6379",
    optional:true,
    usedBy:[ "api",
      "surveyadmin" ] },
  { id:"REDIS_UPSTASH_URL",
    description:"URL of the Redis Upstash database (using HTTP protocol for serverless)",
    example:"https://welcomed-porpoise-41931.upstash.io",
    optional:true,
    usedBy:[ "api",
      "surveyform",
      "surveyadmin",
      "results",
      "results-astro",
      "homepage",
      "charts" ] },
  { id:"REDIS_TOKEN",
    description:"Redis token (needed for Upstash). When using a local setup, the token is set when running the Redis proxy (see Docker-compose file).\n",
    example:"AaMEASQgN...TDJjNDg1NDWQ=",
    usedBy:[ "api",
      "surveyform",
      "surveyadmin",
      "results",
      "results-astro",
      "homepage",
      "charts" ] },
  { id:"GITHUB_TOKEN",
    description:"GitHub access token",
    example:"github_pat_11AndT_knNX54FA...",
    usedBy:[ "api" ] },
  { id:"GITHUB_PATH_SURVEYS",
    description:"Path to surveys repo/directory on GitHub",
    example:"owner/repo/subdir (subdir is optional)",
    usedBy:[ "api" ] },
  { id:"GITHUB_PATH_LOCALES",
    description:"Path to locales repo/directory on GitHub",
    example:"owner/repo/subdir OR owner (in which case it's assumed all locales have their own repo)",
    usedBy:[ "api" ] },
  { id:"GITHUB_PATH_ENTITIES",
    description:"Path to entities repo/directory on GitHub",
    example:"owner/repo/subdir (subdir is optional)",
    usedBy:[ "api" ] },
  { id:"EMAIL_OCTOPUS_APIKEY",
    usedBy:[ "surveyform" ] },
  { id:"DEFAULT_MAIL_FROM",
    example:"surveys@devographics.com",
    optional:true,
    usedBy:[ "surveyform" ] },
  { id:"SMTP_HOST",
    example:"email-smtp.us-east-1.amazonaws.com",
    usedBy:[ "surveyform" ] },
  { id:"SMTP_HOST",
    example:"email-smtp.us-east-1.amazonaws.com",
    usedBy:[ "surveyform" ] },
  { id:"SMTP_PORT",
    example:465,
    usedBy:[ "surveyform" ] },
  { id:"SMTP_SECURE",
    example:"'1' or '' for an emtpy value",
    optional:true,
    usedBy:[ "surveyform" ] },
  { id:"SMTP_USER",
    usedBy:[ "surveyform" ] },
  { id:"SMTP_PASS",
    usedBy:[ "surveyform" ] },
  { id:"ENCRYPTION_KEY",
    description:"Encryption key to hash emails",
    usedBy:[ "surveyform" ] },
  { id:"SECRET_KEY",
    description:"Secret key used to verify external webhook requests Surveyform and API should have a different key Surveyadmin should know both keys to be able to send request New keys can be generated via \"openssl -base64 32\n",
    usedBy:[ "surveyform",
      "api" ] },
  { id:"API_SECRET_KEY",
    usedBy:[ "surveyadmin" ] },
  { id:"SURVEYFORM_SECRET_KEY",
    usedBy:[ "surveyadmin" ] },
  { id:"SURVEYFORM_URL",
    description:"Used to call surveyform webhooks, namely to indicate a change in the loaded values (surveys, entities...)\n",
    usedBy:"api" },
  { id:"ASSETS_URL",
    aliases:[ "NEXT_PUBLIC_ASSETS_URL" ],
    description:"Where to get static assets from. /!\\ in frontend apps, must be public (NEXT_PUBLIC_)",
    example:"https://assets.devographics.com/",
    usedBy:[ "surveyform",
      "results" ] },
  { id:"TOKEN_SECRET",
    description:"Used by magic login",
    example:"cbabc40...115fd1affc789cc6f",
    usedBy:[ "surveyform" ] },
  { id:"SURVEYID",
    description:"The id of the survey, when rendering a results site",
    example:"state_of_css",
    usedBy:[ "results",
      "results-astro",
      "homepage" ] },
  { id:"EDITIONID",
    description:"The id of the survey edition, when rendering a results site",
    example:"css2023",
    usedBy:[ "results",
      "results-astro" ] },
  { id:"FAST_BUILD",
    optional:true,
    description:"Enable \"fast build\" mode, which skips most locales and block subpages",
    example:"'true' if activated, any other value or empty if disabled",
    usedBy:[ "results",
      "homepage" ] },
  { id:"SURVEYS_URL",
    description:"Where to get the cached JSON survey data (deployed via GitHub Pages)",
    example:"https://devographics.github.io/surveys",
    usedBy:[ "results" ] },
  { id:"SENDOWL_API_KEY",
    description:"SendOwl API key (used for selling chart sponsorships)",
    example:"3df5f...",
    usedBy:[ "results" ] },
  { id:"SENDOWL_SECRET",
    description:"SendOwl secret (used for selling chart sponsorships)",
    example:"64754...",
    usedBy:[ "results" ] },
  { id:"LOGS_PATH",
    optional:true,
    description:"Absolute path to logs dir",
    example:"/Users/sacha/monorepo/surveyform/.logs",
    usedBy:[ "results",
      "api",
      "surveyform",
      "surveyadmin" ] },
  { id:"SURVEYS_PATH",
    optional:true,
    description:"Absolute path to local directory from which to load survey outlines",
    example:"/Users/devographics/surveys",
    usedBy:[ "api" ] },
  { id:"LOCALES_PATH",
    optional:true,
    description:"Absolute path to local directory from which to load locales data",
    example:"/Users/devographics/locales",
    usedBy:[ "api" ] },
  { id:"ENTITIES_PATH",
    optional:true,
    description:"Absolute path to local directory from which to load entities",
    example:"/Users/devographics/entities",
    usedBy:[ "api" ] },
  { id:"DISABLE_CACHE",
    optional:true,
    description:"Set to `true` to always fetch data via API",
    example:"'true' or ''",
    usedBy:[ "surveyform",
      "results" ] },
  { id:"PORT",
    optional:true,
    description:"Which port to run the app on",
    example:5000,
    usedBy:[ "api",
      "surveyform",
      "surveyadmin",
      "results",
      "graphiql" ] } ];

var EnvVar = /* @__PURE__ */ ((EnvVar2) => {
  EnvVar2["APP_NAME"] = "APP_NAME";
  EnvVar2["API_URL"] = "API_URL";
  EnvVar2["MONGO_PRIVATE_URI"] = "MONGO_PRIVATE_URI";
  EnvVar2["MONGO_PRIVATE_URI_READONLY"] = "MONGO_PRIVATE_URI_READONLY";
  EnvVar2["MONGO_PRIVATE_DB"] = "MONGO_PRIVATE_DB";
  EnvVar2["MONGO_PUBLIC_URI"] = "MONGO_PUBLIC_URI";
  EnvVar2["MONGO_PUBLIC_URI_READONLY"] = "MONGO_PUBLIC_URI_READONLY";
  EnvVar2["MONGO_PUBLIC_DB"] = "MONGO_PUBLIC_DB";
  EnvVar2["REDIS_URL"] = "REDIS_URL";
  EnvVar2["REDIS_UPSTASH_URL"] = "REDIS_UPSTASH_URL";
  EnvVar2["REDIS_TOKEN"] = "REDIS_TOKEN";
  EnvVar2["GITHUB_TOKEN"] = "GITHUB_TOKEN";
  EnvVar2["GITHUB_PATH_SURVEYS"] = "GITHUB_PATH_SURVEYS";
  EnvVar2["GITHUB_PATH_LOCALES"] = "GITHUB_PATH_LOCALES";
  EnvVar2["GITHUB_PATH_ENTITIES"] = "GITHUB_PATH_ENTITIES";
  EnvVar2["EMAIL_OCTOPUS_APIKEY"] = "EMAIL_OCTOPUS_APIKEY";
  EnvVar2["DEFAULT_MAIL_FROM"] = "DEFAULT_MAIL_FROM";
  EnvVar2["SMTP_HOST"] = "SMTP_HOST";
  EnvVar2["SMTP_PORT"] = "SMTP_PORT";
  EnvVar2["SMTP_SECURE"] = "SMTP_SECURE";
  EnvVar2["SMTP_USER"] = "SMTP_USER";
  EnvVar2["SMTP_PASS"] = "SMTP_PASS";
  EnvVar2["ENCRYPTION_KEY"] = "ENCRYPTION_KEY";
  EnvVar2["SECRET_KEY"] = "SECRET_KEY";
  EnvVar2["ASSETS_URL"] = "ASSETS_URL";
  EnvVar2["NEXT_PUBLIC_ASSETS_URL"] = "NEXT_PUBLIC_ASSETS_URL";
  EnvVar2["LOGS_PATH"] = "LOGS_PATH";
  EnvVar2["SURVEYS_PATH"] = "SURVEYS_PATH";
  EnvVar2["LOCALES_PATH"] = "LOCALES_PATH";
  EnvVar2["ENTITIES_PATH"] = "ENTITIES_PATH";
  EnvVar2["ENABLE_CACHE"] = "ENABLE_CACHE";
  EnvVar2["PORT"] = "PORT";
  EnvVar2["EDITIONID"] = "EDITIONID";
  EnvVar2["SURVEYID"] = "SURVEYID";
  return EnvVar2;
})(EnvVar || {});
const config = data;
const formatVariable = ({ id, description, example }) => {
  return `[${id}] ${description} (ex: ${example})`;
};
let appNameGlobal;
const setAppName = (appName) => {
  appNameGlobal = appName;
};
let envMapGlobal = {};
function setEnvMap(envMap) {
  envMapGlobal = envMap;
}
const getValue = (variable) => {
  const { id, aliases } = variable;
  const value = process.env[id] || envMapGlobal[id];
  if (value) {
    return { id, value };
  } else if (aliases) {
    for (const aliasId of aliases) {
      const aliasValue = process.env[aliasId] || envMapGlobal[id];
      if (aliasValue) {
        return { id: aliasId, value: aliasValue };
      }
    }
  }
  return { id };
};
const getConfig = (options = {}) => {
  const { appName: appName_, showWarnings = false } = options;
  const appName = appName_ || appNameGlobal || getValue({ id: "APP_NAME" /* APP_NAME */ })?.value;
  if (!appName) {
    throw new Error(
      "getConfig: please pass variable, set env variable, or call setAppName() to specify appName"
    );
  }
  const variables = {};
  const optionalVariables = [];
  const missingVariables = [];
  for (const variable of config) {
    const { usedBy, optional = false } = variable;
    if ((usedBy || []).includes(appName)) {
      const { id, value } = getValue(variable);
      if (value) {
        variables[id] = value;
      } else if (optional === true) {
        if (showWarnings) {
          optionalVariables.push(variable);
        }
      } else {
        missingVariables.push(variable);
      }
    }
  }
  if (optionalVariables.length > 0) {
    console.warn(
      `getConfig/${appName}: The following optional environment variables were not defined:
${optionalVariables.map(formatVariable).join("\n")}`
    );
  }
  if (missingVariables.length > 0) {
    throw new Error(
      `getConfig/${appName}: Found the following missing environment variables:
${missingVariables.map(formatVariable).join("\n")}`
    );
  }
  return variables;
};
const getEnvVar = (id) => {
  const config2 = getConfig();
  return config2[id];
};

var AppName = /* @__PURE__ */ ((AppName2) => {
  AppName2["SURVEYFORM"] = "surveyform";
  AppName2["SURVEYADMIN"] = "surveyadmin";
  AppName2["API"] = "api";
  AppName2["RESULTS"] = "results";
  AppName2["RESULTS_ASTRO"] = "results-astro";
  AppName2["GRAPHIQL"] = "graphiql";
  return AppName2;
})(AppName || {});

setEnvMap(Object.assign({"BASE_URL": "/", "MODE": "production", "DEV": false, "PROD": true, "SSR": true, "SITE": undefined, "ASSETS_PREFIX": undefined}, { SURVEYID: "state_of_css", EDITIONID: "css2023", _: process.env._ }));
setAppName(AppName.RESULTS_ASTRO);
function astroEnv() {
  const editionId = getEnvVar(EnvVar.EDITIONID);
  const surveyId = getEnvVar(EnvVar.SURVEYID);
  return { editionId, surveyId };
}

var nodeCache = {exports: {}};

var node_cache = {exports: {}};

var clone = {exports: {}};

var hasRequiredClone;

function requireClone () {
	if (hasRequiredClone) return clone.exports;
	hasRequiredClone = 1;
	(function (module) {
		var clone = (function() {

		function _instanceof(obj, type) {
		  return type != null && obj instanceof type;
		}

		var nativeMap;
		try {
		  nativeMap = Map;
		} catch(_) {
		  // maybe a reference error because no `Map`. Give it a dummy value that no
		  // value will ever be an instanceof.
		  nativeMap = function() {};
		}

		var nativeSet;
		try {
		  nativeSet = Set;
		} catch(_) {
		  nativeSet = function() {};
		}

		var nativePromise;
		try {
		  nativePromise = Promise;
		} catch(_) {
		  nativePromise = function() {};
		}

		/**
		 * Clones (copies) an Object using deep copying.
		 *
		 * This function supports circular references by default, but if you are certain
		 * there are no circular references in your object, you can save some CPU time
		 * by calling clone(obj, false).
		 *
		 * Caution: if `circular` is false and `parent` contains circular references,
		 * your program may enter an infinite loop and crash.
		 *
		 * @param `parent` - the object to be cloned
		 * @param `circular` - set to true if the object to be cloned may contain
		 *    circular references. (optional - true by default)
		 * @param `depth` - set to a number if the object is only to be cloned to
		 *    a particular depth. (optional - defaults to Infinity)
		 * @param `prototype` - sets the prototype to be used when cloning an object.
		 *    (optional - defaults to parent prototype).
		 * @param `includeNonEnumerable` - set to true if the non-enumerable properties
		 *    should be cloned as well. Non-enumerable properties on the prototype
		 *    chain will be ignored. (optional - false by default)
		*/
		function clone(parent, circular, depth, prototype, includeNonEnumerable) {
		  if (typeof circular === 'object') {
		    depth = circular.depth;
		    prototype = circular.prototype;
		    includeNonEnumerable = circular.includeNonEnumerable;
		    circular = circular.circular;
		  }
		  // maintain two arrays for circular references, where corresponding parents
		  // and children have the same index
		  var allParents = [];
		  var allChildren = [];

		  var useBuffer = typeof Buffer != 'undefined';

		  if (typeof circular == 'undefined')
		    circular = true;

		  if (typeof depth == 'undefined')
		    depth = Infinity;

		  // recurse this function so we don't reset allParents and allChildren
		  function _clone(parent, depth) {
		    // cloning null always returns null
		    if (parent === null)
		      return null;

		    if (depth === 0)
		      return parent;

		    var child;
		    var proto;
		    if (typeof parent != 'object') {
		      return parent;
		    }

		    if (_instanceof(parent, nativeMap)) {
		      child = new nativeMap();
		    } else if (_instanceof(parent, nativeSet)) {
		      child = new nativeSet();
		    } else if (_instanceof(parent, nativePromise)) {
		      child = new nativePromise(function (resolve, reject) {
		        parent.then(function(value) {
		          resolve(_clone(value, depth - 1));
		        }, function(err) {
		          reject(_clone(err, depth - 1));
		        });
		      });
		    } else if (clone.__isArray(parent)) {
		      child = [];
		    } else if (clone.__isRegExp(parent)) {
		      child = new RegExp(parent.source, __getRegExpFlags(parent));
		      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
		    } else if (clone.__isDate(parent)) {
		      child = new Date(parent.getTime());
		    } else if (useBuffer && Buffer.isBuffer(parent)) {
		      if (Buffer.allocUnsafe) {
		        // Node.js >= 4.5.0
		        child = Buffer.allocUnsafe(parent.length);
		      } else {
		        // Older Node.js versions
		        child = new Buffer(parent.length);
		      }
		      parent.copy(child);
		      return child;
		    } else if (_instanceof(parent, Error)) {
		      child = Object.create(parent);
		    } else {
		      if (typeof prototype == 'undefined') {
		        proto = Object.getPrototypeOf(parent);
		        child = Object.create(proto);
		      }
		      else {
		        child = Object.create(prototype);
		        proto = prototype;
		      }
		    }

		    if (circular) {
		      var index = allParents.indexOf(parent);

		      if (index != -1) {
		        return allChildren[index];
		      }
		      allParents.push(parent);
		      allChildren.push(child);
		    }

		    if (_instanceof(parent, nativeMap)) {
		      parent.forEach(function(value, key) {
		        var keyChild = _clone(key, depth - 1);
		        var valueChild = _clone(value, depth - 1);
		        child.set(keyChild, valueChild);
		      });
		    }
		    if (_instanceof(parent, nativeSet)) {
		      parent.forEach(function(value) {
		        var entryChild = _clone(value, depth - 1);
		        child.add(entryChild);
		      });
		    }

		    for (var i in parent) {
		      var attrs;
		      if (proto) {
		        attrs = Object.getOwnPropertyDescriptor(proto, i);
		      }

		      if (attrs && attrs.set == null) {
		        continue;
		      }
		      child[i] = _clone(parent[i], depth - 1);
		    }

		    if (Object.getOwnPropertySymbols) {
		      var symbols = Object.getOwnPropertySymbols(parent);
		      for (var i = 0; i < symbols.length; i++) {
		        // Don't need to worry about cloning a symbol because it is a primitive,
		        // like a number or string.
		        var symbol = symbols[i];
		        var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
		        if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
		          continue;
		        }
		        child[symbol] = _clone(parent[symbol], depth - 1);
		        if (!descriptor.enumerable) {
		          Object.defineProperty(child, symbol, {
		            enumerable: false
		          });
		        }
		      }
		    }

		    if (includeNonEnumerable) {
		      var allPropertyNames = Object.getOwnPropertyNames(parent);
		      for (var i = 0; i < allPropertyNames.length; i++) {
		        var propertyName = allPropertyNames[i];
		        var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
		        if (descriptor && descriptor.enumerable) {
		          continue;
		        }
		        child[propertyName] = _clone(parent[propertyName], depth - 1);
		        Object.defineProperty(child, propertyName, {
		          enumerable: false
		        });
		      }
		    }

		    return child;
		  }

		  return _clone(parent, depth);
		}

		/**
		 * Simple flat clone using prototype, accepts only objects, usefull for property
		 * override on FLAT configuration object (no nested props).
		 *
		 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
		 * works.
		 */
		clone.clonePrototype = function clonePrototype(parent) {
		  if (parent === null)
		    return null;

		  var c = function () {};
		  c.prototype = parent;
		  return new c();
		};

		// private utility functions

		function __objToStr(o) {
		  return Object.prototype.toString.call(o);
		}
		clone.__objToStr = __objToStr;

		function __isDate(o) {
		  return typeof o === 'object' && __objToStr(o) === '[object Date]';
		}
		clone.__isDate = __isDate;

		function __isArray(o) {
		  return typeof o === 'object' && __objToStr(o) === '[object Array]';
		}
		clone.__isArray = __isArray;

		function __isRegExp(o) {
		  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
		}
		clone.__isRegExp = __isRegExp;

		function __getRegExpFlags(re) {
		  var flags = '';
		  if (re.global) flags += 'g';
		  if (re.ignoreCase) flags += 'i';
		  if (re.multiline) flags += 'm';
		  return flags;
		}
		clone.__getRegExpFlags = __getRegExpFlags;

		return clone;
		})();

		if (module.exports) {
		  module.exports = clone;
		} 
	} (clone));
	return clone.exports;
}

/*
 * node-cache 5.1.2 ( 2020-07-01 )
 * https://github.com/node-cache/node-cache
 *
 * Released under the MIT license
 * https://github.com/node-cache/node-cache/blob/master/LICENSE
 *
 * Maintained by  (  )
*/

var hasRequiredNode_cache;

function requireNode_cache () {
	if (hasRequiredNode_cache) return node_cache.exports;
	hasRequiredNode_cache = 1;
	(function() {
	  var EventEmitter, clone,
	    splice = [].splice,
	    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } },
	    indexOf = [].indexOf;

	  clone = requireClone();

	  EventEmitter = require$$0.EventEmitter;

	  // generate superclass
	  node_cache.exports = (function() {
	    class NodeCache extends EventEmitter {
	      constructor(options = {}) {
	        super();
	        // ## get

	        // get a cached key and change the stats

	        // **Parameters:**

	        // * `key` ( String | Number ): cache key

	        // **Example:**

	        //	myCache.get "myKey", ( err, val )

	        this.get = this.get.bind(this);
	        // ## mget

	        // get multiple cached keys at once and change the stats

	        // **Parameters:**

	        // * `keys` ( String|Number[] ): an array of keys

	        // **Example:**

	        //	myCache.mget [ "foo", "bar" ]

	        this.mget = this.mget.bind(this);
	        // ## set

	        // set a cached key and change the stats

	        // **Parameters:**

	        // * `key` ( String | Number ): cache key
	        // * `value` ( Any ): A element to cache. If the option `option.forceString` is `true` the module trys to translate it to a serialized JSON
	        // * `[ ttl ]` ( Number | String ): ( optional ) The time to live in seconds.

	        // **Example:**

	        //	myCache.set "myKey", "my_String Value"

	        //	myCache.set "myKey", "my_String Value", 10

	        this.set = this.set.bind(this);
	        
	        // ## mset

	        // set multiple keys at once

	        // **Parameters:**

	        // * `keyValueSet` ( Object[] ): an array of object which includes key,value and ttl

	        // **Example:**

	        //	myCache.mset(
	        //		[
	        //			{
	        //				key: "myKey",
	        //				val: "myValue",
	        //				ttl: [ttl in seconds]
	        //			}
	        //		])

	        this.mset = this.mset.bind(this);
	        // ## del

	        // remove keys

	        // **Parameters:**

	        // * `keys` ( String | Number | String|Number[] ): cache key to delete or a array of cache keys

	        // **Return**

	        // ( Number ): Number of deleted keys

	        // **Example:**

	        //	myCache.del( "myKey" )

	        this.del = this.del.bind(this);
	        // ## take

	        // get the cached value and remove the key from the cache.
	        // Equivalent to calling `get(key)` + `del(key)`.
	        // Useful for implementing `single use` mechanism such as OTP, where once a value is read it will become obsolete.

	        // **Parameters:**

	        // * `key` ( String | Number ): cache key

	        // **Example:**

	        //	myCache.take "myKey", ( err, val )

	        this.take = this.take.bind(this);
	        // ## ttl

	        // reset or redefine the ttl of a key. `ttl` = 0 means infinite lifetime.
	        // If `ttl` is not passed the default ttl is used.
	        // If `ttl` < 0 the key will be deleted.

	        // **Parameters:**

	        // * `key` ( String | Number ): cache key to reset the ttl value
	        // * `ttl` ( Number ): ( optional -> options.stdTTL || 0 ) The time to live in seconds

	        // **Return**

	        // ( Boolen ): key found and ttl set

	        // **Example:**

	        //	myCache.ttl( "myKey" ) // will set ttl to default ttl

	        //	myCache.ttl( "myKey", 1000 )

	        this.ttl = this.ttl.bind(this);
	        // ## getTtl

	        // receive the ttl of a key.

	        // **Parameters:**

	        // * `key` ( String | Number ): cache key to check the ttl value

	        // **Return**

	        // ( Number|undefined ): The timestamp in ms when the key will expire, 0 if it will never expire or undefined if it not exists

	        // **Example:**

	        //	myCache.getTtl( "myKey" )

	        this.getTtl = this.getTtl.bind(this);
	        // ## keys

	        // list all keys within this cache

	        // **Return**

	        // ( Array ): An array of all keys

	        // **Example:**

	        //     _keys = myCache.keys()

	        //     # [ "foo", "bar", "fizz", "buzz", "anotherKeys" ]

	        this.keys = this.keys.bind(this);
	        // ## has

	        // Check if a key is cached

	        // **Parameters:**

	        // * `key` ( String | Number ): cache key to check the ttl value

	        // **Return**

	        // ( Boolean ): A boolean that indicates if the key is cached

	        // **Example:**

	        //     _exists = myCache.has('myKey')

	        //     # true

	        this.has = this.has.bind(this);
	        // ## getStats

	        // get the stats

	        // **Parameters:**

	        // -

	        // **Return**

	        // ( Object ): Stats data

	        // **Example:**

	        //     myCache.getStats()
	        //     # {
	        //     # hits: 0,
	        //     # misses: 0,
	        //     # keys: 0,
	        //     # ksize: 0,
	        //     # vsize: 0
	        //     # }

	        this.getStats = this.getStats.bind(this);
	        // ## flushAll

	        // flush the whole data and reset the stats

	        // **Example:**

	        //     myCache.flushAll()

	        //     myCache.getStats()
	        //     # {
	        //     # hits: 0,
	        //     # misses: 0,
	        //     # keys: 0,
	        //     # ksize: 0,
	        //     # vsize: 0
	        //     # }

	        this.flushAll = this.flushAll.bind(this);
	        
	        // ## flushStats

	        // flush the stats and reset all counters to 0

	        // **Example:**

	        //     myCache.flushStats()

	        //     myCache.getStats()
	        //     # {
	        //     # hits: 0,
	        //     # misses: 0,
	        //     # keys: 0,
	        //     # ksize: 0,
	        //     # vsize: 0
	        //     # }

	        this.flushStats = this.flushStats.bind(this);
	        // ## close

	        // This will clear the interval timeout which is set on checkperiod option.

	        // **Example:**

	        //     myCache.close()

	        this.close = this.close.bind(this);
	        // ## _checkData

	        // internal housekeeping method.
	        // Check all the cached data and delete the invalid values
	        this._checkData = this._checkData.bind(this);
	        // ## _check

	        // internal method the check the value. If it's not valid any more delete it
	        this._check = this._check.bind(this);
	        // ## _isInvalidKey

	        // internal method to check if the type of a key is either `number` or `string`
	        this._isInvalidKey = this._isInvalidKey.bind(this);
	        // ## _wrap

	        // internal method to wrap a value in an object with some metadata
	        this._wrap = this._wrap.bind(this);
	        // ## _getValLength

	        // internal method to calculate the value length
	        this._getValLength = this._getValLength.bind(this);
	        // ## _error

	        // internal method to handle an error message
	        this._error = this._error.bind(this);
	        // ## _initErrors

	        // internal method to generate error message templates
	        this._initErrors = this._initErrors.bind(this);
	        this.options = options;
	        this._initErrors();
	        // container for cached data
	        this.data = {};
	        // module options
	        this.options = Object.assign({
	          // convert all elements to string
	          forceString: false,
	          // used standard size for calculating value size
	          objectValueSize: 80,
	          promiseValueSize: 80,
	          arrayValueSize: 40,
	          // standard time to live in seconds. 0 = infinity;
	          stdTTL: 0,
	          // time in seconds to check all data and delete expired keys
	          checkperiod: 600,
	          // en/disable cloning of variables. If `true` you'll get a copy of the cached variable. If `false` you'll save and get just the reference
	          useClones: true,
	          // whether values should be deleted automatically at expiration
	          deleteOnExpire: true,
	          // enable legacy callbacks
	          enableLegacyCallbacks: false,
	          // max amount of keys that are being stored
	          maxKeys: -1
	        }, this.options);
	        // generate functions with callbacks (legacy)
	        if (this.options.enableLegacyCallbacks) {
	          console.warn("WARNING! node-cache legacy callback support will drop in v6.x");
	          ["get", "mget", "set", "del", "ttl", "getTtl", "keys", "has"].forEach((methodKey) => {
	            var oldMethod;
	            // reference real function
	            oldMethod = this[methodKey];
	            this[methodKey] = function(...args) {
	              var cb, err, ref, res;
	              ref = args, [...args] = ref, [cb] = splice.call(args, -1);
	              // return a callback if cb is defined and a function
	              if (typeof cb === "function") {
	                try {
	                  res = oldMethod(...args);
	                  cb(null, res);
	                } catch (error1) {
	                  err = error1;
	                  cb(err);
	                }
	              } else {
	                return oldMethod(...args, cb);
	              }
	            };
	          });
	        }
	        // statistics container
	        this.stats = {
	          hits: 0,
	          misses: 0,
	          keys: 0,
	          ksize: 0,
	          vsize: 0
	        };
	        // pre allocate valid keytypes array
	        this.validKeyTypes = ["string", "number"];
	        // initalize checking period
	        this._checkData();
	        return;
	      }

	      get(key) {
	        var _ret, err;
	        boundMethodCheck(this, NodeCache);
	        // handle invalid key types
	        if ((err = this._isInvalidKey(key)) != null) {
	          throw err;
	        }
	        // get data and incremet stats
	        if ((this.data[key] != null) && this._check(key, this.data[key])) {
	          this.stats.hits++;
	          _ret = this._unwrap(this.data[key]);
	          // return data
	          return _ret;
	        } else {
	          // if not found return undefined
	          this.stats.misses++;
	          return void 0;
	        }
	      }

	      mget(keys) {
	        var _err, err, i, key, len, oRet;
	        boundMethodCheck(this, NodeCache);
	        // convert a string to an array of one key
	        if (!Array.isArray(keys)) {
	          _err = this._error("EKEYSTYPE");
	          throw _err;
	        }
	        // define return
	        oRet = {};
	        for (i = 0, len = keys.length; i < len; i++) {
	          key = keys[i];
	          // handle invalid key types
	          if ((err = this._isInvalidKey(key)) != null) {
	            throw err;
	          }
	          // get data and increment stats
	          if ((this.data[key] != null) && this._check(key, this.data[key])) {
	            this.stats.hits++;
	            oRet[key] = this._unwrap(this.data[key]);
	          } else {
	            // if not found return a error
	            this.stats.misses++;
	          }
	        }
	        // return all found keys
	        return oRet;
	      }

	      set(key, value, ttl) {
	        var _err, err, existent;
	        boundMethodCheck(this, NodeCache);
	        // check if cache is overflowing
	        if (this.options.maxKeys > -1 && this.stats.keys >= this.options.maxKeys) {
	          _err = this._error("ECACHEFULL");
	          throw _err;
	        }
	        // force the data to string
	        if (this.options.forceString && !typeof value === "string") {
	          value = JSON.stringify(value);
	        }
	        // set default ttl if not passed
	        if (ttl == null) {
	          ttl = this.options.stdTTL;
	        }
	        // handle invalid key types
	        if ((err = this._isInvalidKey(key)) != null) {
	          throw err;
	        }
	        // internal helper variables
	        existent = false;
	        // remove existing data from stats
	        if (this.data[key]) {
	          existent = true;
	          this.stats.vsize -= this._getValLength(this._unwrap(this.data[key], false));
	        }
	        // set the value
	        this.data[key] = this._wrap(value, ttl);
	        this.stats.vsize += this._getValLength(value);
	        // only add the keys and key-size if the key is new
	        if (!existent) {
	          this.stats.ksize += this._getKeyLength(key);
	          this.stats.keys++;
	        }
	        this.emit("set", key, value);
	        // return true
	        return true;
	      }

	      mset(keyValueSet) {
	        var _err, err, i, j, key, keyValuePair, len, len1, ttl, val;
	        boundMethodCheck(this, NodeCache);
	        // check if cache is overflowing
	        if (this.options.maxKeys > -1 && this.stats.keys + keyValueSet.length >= this.options.maxKeys) {
	          _err = this._error("ECACHEFULL");
	          throw _err;
	        }

	// loop over keyValueSet to validate key and ttl
	        for (i = 0, len = keyValueSet.length; i < len; i++) {
	          keyValuePair = keyValueSet[i];
	          ({key, val, ttl} = keyValuePair);
	          // check if there is ttl and it's a number
	          if (ttl && typeof ttl !== "number") {
	            _err = this._error("ETTLTYPE");
	            throw _err;
	          }
	          // handle invalid key types
	          if ((err = this._isInvalidKey(key)) != null) {
	            throw err;
	          }
	        }
	        for (j = 0, len1 = keyValueSet.length; j < len1; j++) {
	          keyValuePair = keyValueSet[j];
	          ({key, val, ttl} = keyValuePair);
	          this.set(key, val, ttl);
	        }
	        return true;
	      }

	      del(keys) {
	        var delCount, err, i, key, len, oldVal;
	        boundMethodCheck(this, NodeCache);
	        // convert keys to an array of itself
	        if (!Array.isArray(keys)) {
	          keys = [keys];
	        }
	        delCount = 0;
	        for (i = 0, len = keys.length; i < len; i++) {
	          key = keys[i];
	          // handle invalid key types
	          if ((err = this._isInvalidKey(key)) != null) {
	            throw err;
	          }
	          // only delete if existent
	          if (this.data[key] != null) {
	            // calc the stats
	            this.stats.vsize -= this._getValLength(this._unwrap(this.data[key], false));
	            this.stats.ksize -= this._getKeyLength(key);
	            this.stats.keys--;
	            delCount++;
	            // delete the value
	            oldVal = this.data[key];
	            delete this.data[key];
	            // return true
	            this.emit("del", key, oldVal.v);
	          }
	        }
	        return delCount;
	      }

	      take(key) {
	        var _ret;
	        boundMethodCheck(this, NodeCache);
	        _ret = this.get(key);
	        if ((_ret != null)) {
	          this.del(key);
	        }
	        return _ret;
	      }

	      ttl(key, ttl) {
	        var err;
	        boundMethodCheck(this, NodeCache);
	        ttl || (ttl = this.options.stdTTL);
	        if (!key) {
	          return false;
	        }
	        // handle invalid key types
	        if ((err = this._isInvalidKey(key)) != null) {
	          throw err;
	        }
	        // check for existent data and update the ttl value
	        if ((this.data[key] != null) && this._check(key, this.data[key])) {
	          // if ttl < 0 delete the key. otherwise reset the value
	          if (ttl >= 0) {
	            this.data[key] = this._wrap(this.data[key].v, ttl, false);
	          } else {
	            this.del(key);
	          }
	          return true;
	        } else {
	          // return false if key has not been found
	          return false;
	        }
	      }

	      getTtl(key) {
	        var _ttl, err;
	        boundMethodCheck(this, NodeCache);
	        if (!key) {
	          return void 0;
	        }
	        // handle invalid key types
	        if ((err = this._isInvalidKey(key)) != null) {
	          throw err;
	        }
	        // check for existant data and update the ttl value
	        if ((this.data[key] != null) && this._check(key, this.data[key])) {
	          _ttl = this.data[key].t;
	          return _ttl;
	        } else {
	          // return undefined if key has not been found
	          return void 0;
	        }
	      }

	      keys() {
	        var _keys;
	        boundMethodCheck(this, NodeCache);
	        _keys = Object.keys(this.data);
	        return _keys;
	      }

	      has(key) {
	        var _exists;
	        boundMethodCheck(this, NodeCache);
	        _exists = (this.data[key] != null) && this._check(key, this.data[key]);
	        return _exists;
	      }

	      getStats() {
	        boundMethodCheck(this, NodeCache);
	        return this.stats;
	      }

	      flushAll(_startPeriod = true) {
	        boundMethodCheck(this, NodeCache);
	        // parameter just for testing

	        // set data empty
	        this.data = {};
	        // reset stats
	        this.stats = {
	          hits: 0,
	          misses: 0,
	          keys: 0,
	          ksize: 0,
	          vsize: 0
	        };
	        // reset check period
	        this._killCheckPeriod();
	        this._checkData(_startPeriod);
	        this.emit("flush");
	      }

	      flushStats() {
	        boundMethodCheck(this, NodeCache);
	        // reset stats
	        this.stats = {
	          hits: 0,
	          misses: 0,
	          keys: 0,
	          ksize: 0,
	          vsize: 0
	        };
	        this.emit("flush_stats");
	      }

	      close() {
	        boundMethodCheck(this, NodeCache);
	        this._killCheckPeriod();
	      }

	      _checkData(startPeriod = true) {
	        var key, ref, value;
	        boundMethodCheck(this, NodeCache);
	        ref = this.data;
	        // run the housekeeping method
	        for (key in ref) {
	          value = ref[key];
	          this._check(key, value);
	        }
	        if (startPeriod && this.options.checkperiod > 0) {
	          this.checkTimeout = setTimeout(this._checkData, this.options.checkperiod * 1000, startPeriod);
	          if ((this.checkTimeout != null) && (this.checkTimeout.unref != null)) {
	            this.checkTimeout.unref();
	          }
	        }
	      }

	      // ## _killCheckPeriod

	      // stop the checkdata period. Only needed to abort the script in testing mode.
	      _killCheckPeriod() {
	        if (this.checkTimeout != null) {
	          return clearTimeout(this.checkTimeout);
	        }
	      }

	      _check(key, data) {
	        var _retval;
	        boundMethodCheck(this, NodeCache);
	        _retval = true;
	        // data is invalid if the ttl is too old and is not 0
	        // console.log data.t < Date.now(), data.t, Date.now()
	        if (data.t !== 0 && data.t < Date.now()) {
	          if (this.options.deleteOnExpire) {
	            _retval = false;
	            this.del(key);
	          }
	          this.emit("expired", key, this._unwrap(data));
	        }
	        return _retval;
	      }

	      _isInvalidKey(key) {
	        var ref;
	        boundMethodCheck(this, NodeCache);
	        if (ref = typeof key, indexOf.call(this.validKeyTypes, ref) < 0) {
	          return this._error("EKEYTYPE", {
	            type: typeof key
	          });
	        }
	      }

	      _wrap(value, ttl, asClone = true) {
	        var livetime, now, ttlMultiplicator;
	        boundMethodCheck(this, NodeCache);
	        if (!this.options.useClones) {
	          asClone = false;
	        }
	        // define the time to live
	        now = Date.now();
	        livetime = 0;
	        ttlMultiplicator = 1000;
	        // use given ttl
	        if (ttl === 0) {
	          livetime = 0;
	        } else if (ttl) {
	          livetime = now + (ttl * ttlMultiplicator);
	        } else {
	          // use standard ttl
	          if (this.options.stdTTL === 0) {
	            livetime = this.options.stdTTL;
	          } else {
	            livetime = now + (this.options.stdTTL * ttlMultiplicator);
	          }
	        }
	        // return the wrapped value
	        return {
	          t: livetime,
	          v: asClone ? clone(value) : value
	        };
	      }

	      // ## _unwrap

	      // internal method to extract get the value out of the wrapped value
	      _unwrap(value, asClone = true) {
	        if (!this.options.useClones) {
	          asClone = false;
	        }
	        if (value.v != null) {
	          if (asClone) {
	            return clone(value.v);
	          } else {
	            return value.v;
	          }
	        }
	        return null;
	      }

	      // ## _getKeyLength

	      // internal method the calculate the key length
	      _getKeyLength(key) {
	        return key.toString().length;
	      }

	      _getValLength(value) {
	        boundMethodCheck(this, NodeCache);
	        if (typeof value === "string") {
	          // if the value is a String get the real length
	          return value.length;
	        } else if (this.options.forceString) {
	          // force string if it's defined and not passed
	          return JSON.stringify(value).length;
	        } else if (Array.isArray(value)) {
	          // if the data is an Array multiply each element with a defined default length
	          return this.options.arrayValueSize * value.length;
	        } else if (typeof value === "number") {
	          return 8;
	        } else if (typeof (value != null ? value.then : void 0) === "function") {
	          // if the data is a Promise, use defined default
	          // (can't calculate actual/resolved value size synchronously)
	          return this.options.promiseValueSize;
	        } else if (typeof Buffer !== "undefined" && Buffer !== null ? Buffer.isBuffer(value) : void 0) {
	          return value.length;
	        } else if ((value != null) && typeof value === "object") {
	          // if the data is an Object multiply each element with a defined default length
	          return this.options.objectValueSize * Object.keys(value).length;
	        } else if (typeof value === "boolean") {
	          return 8;
	        } else {
	          // default fallback
	          return 0;
	        }
	      }

	      _error(type, data = {}) {
	        var error;
	        boundMethodCheck(this, NodeCache);
	        // generate the error object
	        error = new Error();
	        error.name = type;
	        error.errorcode = type;
	        error.message = this.ERRORS[type] != null ? this.ERRORS[type](data) : "-";
	        error.data = data;
	        // return the error object
	        return error;
	      }

	      _initErrors() {
	        var _errMsg, _errT, ref;
	        boundMethodCheck(this, NodeCache);
	        this.ERRORS = {};
	        ref = this._ERRORS;
	        for (_errT in ref) {
	          _errMsg = ref[_errT];
	          this.ERRORS[_errT] = this.createErrorMessage(_errMsg);
	        }
	      }

	      createErrorMessage(errMsg) {
	        return function(args) {
	          return errMsg.replace("__key", args.type);
	        };
	      }

	    }
	    NodeCache.prototype._ERRORS = {
	      "ENOTFOUND": "Key `__key` not found",
	      "ECACHEFULL": "Cache max keys amount exceeded",
	      "EKEYTYPE": "The key argument has to be of type `string` or `number`. Found: `__key`",
	      "EKEYSTYPE": "The keys argument has to be an array.",
	      "ETTLTYPE": "The ttl argument has to be a number."
	    };

	    return NodeCache;

	  }).call(this);

	}).call(commonjsGlobal);
	return node_cache.exports;
}

/*
 * node-cache 5.1.2 ( 2020-07-01 )
 * https://github.com/node-cache/node-cache
 *
 * Released under the MIT license
 * https://github.com/node-cache/node-cache/blob/master/LICENSE
 *
 * Maintained by  (  )
*/

(function() {
  var exports;

  exports = nodeCache.exports = requireNode_cache();

  exports.version = '5.1.2';

}).call(commonjsGlobal);

var nodeCacheExports = nodeCache.exports;
const NodeCache = /*@__PURE__*/getDefaultExportFromCjs(nodeCacheExports);

/**
 * Result of a bad request to upstash
 */
class UpstashError extends Error {
    constructor(message) {
        super(message);
        this.name = "UpstashError";
    }
}

function parseRecursive(obj) {
    const parsed = Array.isArray(obj)
        ? obj.map((o) => {
            try {
                return parseRecursive(o);
            }
            catch {
                return o;
            }
        })
        : JSON.parse(obj);
    /**
     * Parsing very large numbers can result in MAX_SAFE_INTEGER
     * overflow. In that case we return the number as string instead.
     */
    if (typeof parsed === "number" && parsed.toString() != obj) {
        return obj;
    }
    return parsed;
}
function parseResponse(result) {
    try {
        /**
         * Try to parse the response if possible
         */
        return parseRecursive(result);
    }
    catch {
        return result;
    }
}

const defaultSerializer = (c) => {
    switch (typeof c) {
        case "string":
        case "number":
        case "boolean":
            return c;
        default:
            return JSON.stringify(c);
    }
};
/**
 * Command offers default (de)serialization and the exec method to all commands.
 *
 * TData represents what the user will enter or receive,
 * TResult is the raw data returned from upstash, which may need to be transformed or parsed.
 */
class Command {
    /**
     * Create a new command instance.
     *
     * You can define a custom `deserialize` function. By default we try to deserialize as json.
     */
    constructor(command, opts) {
        Object.defineProperty(this, "command", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "serialize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "deserialize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.serialize = defaultSerializer;
        this.deserialize = typeof opts?.automaticDeserialization === "undefined" ||
            opts.automaticDeserialization
            ? opts?.deserialize ?? parseResponse
            : (x) => x;
        this.command = command.map((c) => this.serialize(c));
    }
    /**
     * Execute the command using a client.
     */
    async exec(client) {
        const { result, error } = await client.request({
            body: this.command,
        });
        if (error) {
            throw new UpstashError(error);
        }
        if (typeof result === "undefined") {
            throw new Error("Request did not return a result");
        }
        return this.deserialize(result);
    }
}

/**
 * @see https://redis.io/commands/append
 */
class AppendCommand extends Command {
    constructor(cmd, opts) {
        super(["append", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/bitcount
 */
class BitCountCommand extends Command {
    constructor([key, start, end], opts) {
        const command = ["bitcount", key];
        if (typeof start === "number") {
            command.push(start);
        }
        if (typeof end === "number") {
            command.push(end);
        }
        super(command, opts);
    }
}

/**
 * @see https://redis.io/commands/bitop
 */
class BitOpCommand extends Command {
    constructor(cmd, opts) {
        super(["bitop", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/bitpos
 */
class BitPosCommand extends Command {
    constructor(cmd, opts) {
        super(["bitpos", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/dbsize
 */
class DBSizeCommand extends Command {
    constructor(opts) {
        super(["dbsize"], opts);
    }
}

/**
 * @see https://redis.io/commands/decr
 */
class DecrCommand extends Command {
    constructor(cmd, opts) {
        super(["decr", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/decrby
 */
class DecrByCommand extends Command {
    constructor(cmd, opts) {
        super(["decrby", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/del
 */
class DelCommand extends Command {
    constructor(cmd, opts) {
        super(["del", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/echo
 */
class EchoCommand extends Command {
    constructor(cmd, opts) {
        super(["echo", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/eval
 */
class EvalCommand extends Command {
    constructor([script, keys, args], opts) {
        super(["eval", script, keys.length, ...keys, ...(args ?? [])], opts);
    }
}

/**
 * @see https://redis.io/commands/evalsha
 */
class EvalshaCommand extends Command {
    constructor([sha, keys, args], opts) {
        super(["evalsha", sha, keys.length, ...keys, ...(args ?? [])], opts);
    }
}

/**
 * @see https://redis.io/commands/exists
 */
class ExistsCommand extends Command {
    constructor(cmd, opts) {
        super(["exists", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/expire
 */
class ExpireCommand extends Command {
    constructor(cmd, opts) {
        super(["expire", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/expireat
 */
class ExpireAtCommand extends Command {
    constructor(cmd, opts) {
        super(["expireat", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/flushall
 */
class FlushAllCommand extends Command {
    constructor(args, opts) {
        const command = ["flushall"];
        if (args && args.length > 0 && args[0].async) {
            command.push("async");
        }
        super(command, opts);
    }
}

/**
 * @see https://redis.io/commands/flushdb
 */
class FlushDBCommand extends Command {
    constructor([opts], cmdOpts) {
        const command = ["flushdb"];
        if (opts?.async) {
            command.push("async");
        }
        super(command, cmdOpts);
    }
}

/**
 * @see https://redis.io/commands/get
 */
class GetCommand extends Command {
    constructor(cmd, opts) {
        super(["get", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/getbit
 */
class GetBitCommand extends Command {
    constructor(cmd, opts) {
        super(["getbit", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/getdel
 */
class GetDelCommand extends Command {
    constructor(cmd, opts) {
        super(["getdel", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/getrange
 */
class GetRangeCommand extends Command {
    constructor(cmd, opts) {
        super(["getrange", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/getset
 */
class GetSetCommand extends Command {
    constructor(cmd, opts) {
        super(["getset", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/hdel
 */
class HDelCommand extends Command {
    constructor(cmd, opts) {
        super(["hdel", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/hexists
 */
class HExistsCommand extends Command {
    constructor(cmd, opts) {
        super(["hexists", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/hget
 */
class HGetCommand extends Command {
    constructor(cmd, opts) {
        super(["hget", ...cmd], opts);
    }
}

function deserialize$2(result) {
    if (result.length === 0) {
        return null;
    }
    const obj = {};
    while (result.length >= 2) {
        const key = result.shift();
        const value = result.shift();
        try {
            obj[key] = JSON.parse(value);
        }
        catch {
            obj[key] = value;
        }
    }
    return obj;
}
/**
 * @see https://redis.io/commands/hgetall
 */
class HGetAllCommand extends Command {
    constructor(cmd, opts) {
        super(["hgetall", ...cmd], {
            deserialize: (result) => deserialize$2(result),
            ...opts,
        });
    }
}

/**
 * @see https://redis.io/commands/hincrby
 */
class HIncrByCommand extends Command {
    constructor(cmd, opts) {
        super(["hincrby", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/hincrbyfloat
 */
class HIncrByFloatCommand extends Command {
    constructor(cmd, opts) {
        super(["hincrbyfloat", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/hkeys
 */
class HKeysCommand extends Command {
    constructor([key], opts) {
        super(["hkeys", key], opts);
    }
}

/**
 * @see https://redis.io/commands/hlen
 */
class HLenCommand extends Command {
    constructor(cmd, opts) {
        super(["hlen", ...cmd], opts);
    }
}

function deserialize$1(fields, result) {
    if (result.length === 0 || result.every((field) => field === null)) {
        return null;
    }
    const obj = {};
    for (let i = 0; i < fields.length; i++) {
        try {
            obj[fields[i]] = JSON.parse(result[i]);
        }
        catch {
            obj[fields[i]] = result[i];
        }
    }
    return obj;
}
/**
 * hmget returns an object of all requested fields from a hash
 * The field values are returned as an object like this:
 * ```ts
 * {[fieldName: string]: T | null}
 * ```
 *
 * In case the hash does not exist or all fields are empty `null` is returned
 *
 * @see https://redis.io/commands/hmget
 */
class HMGetCommand extends Command {
    constructor([key, ...fields], opts) {
        super(["hmget", key, ...fields], {
            deserialize: (result) => deserialize$1(fields, result),
            ...opts,
        });
    }
}

/**
 * @see https://redis.io/commands/hmset
 */
class HMSetCommand extends Command {
    constructor([key, kv], opts) {
        super([
            "hmset",
            key,
            ...Object.entries(kv).flatMap(([field, value]) => [field, value]),
        ], opts);
    }
}

function deserialize(result) {
    if (result.length === 0) {
        return null;
    }
    const obj = {};
    while (result.length >= 2) {
        const key = result.shift();
        const value = result.shift();
        try {
            obj[key] = JSON.parse(value);
        }
        catch {
            obj[key] = value;
        }
    }
    return obj;
}
/**
 * @see https://redis.io/commands/hrandfield
 */
class HRandFieldCommand extends Command {
    constructor(cmd, opts) {
        const command = ["hrandfield", cmd[0]];
        if (typeof cmd[1] === "number") {
            command.push(cmd[1]);
        }
        if (cmd[2]) {
            command.push("WITHVALUES");
        }
        super(command, {
            // @ts-ignore TODO:
            deserialize: cmd[2]
                ? (result) => deserialize(result)
                : opts?.deserialize,
            ...opts,
        });
    }
}

/**
 * @see https://redis.io/commands/hscan
 */
class HScanCommand extends Command {
    constructor([key, cursor, cmdOpts], opts) {
        const command = ["hscan", key, cursor];
        if (cmdOpts?.match) {
            command.push("match", cmdOpts.match);
        }
        if (typeof cmdOpts?.count === "number") {
            command.push("count", cmdOpts.count);
        }
        super(command, opts);
    }
}

/**
 * @see https://redis.io/commands/hset
 */
class HSetCommand extends Command {
    constructor([key, kv], opts) {
        super([
            "hset",
            key,
            ...Object.entries(kv).flatMap(([field, value]) => [field, value]),
        ], opts);
    }
}

/**
 * @see https://redis.io/commands/hsetnx
 */
class HSetNXCommand extends Command {
    constructor(cmd, opts) {
        super(["hsetnx", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/hstrlen
 */
class HStrLenCommand extends Command {
    constructor(cmd, opts) {
        super(["hstrlen", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/hvals
 */
class HValsCommand extends Command {
    constructor(cmd, opts) {
        super(["hvals", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/incr
 */
class IncrCommand extends Command {
    constructor(cmd, opts) {
        super(["incr", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/incrby
 */
class IncrByCommand extends Command {
    constructor(cmd, opts) {
        super(["incrby", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/incrbyfloat
 */
class IncrByFloatCommand extends Command {
    constructor(cmd, opts) {
        super(["incrbyfloat", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.arrappend
 */
class JsonArrAppendCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.ARRAPPEND", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.arrindex
 */
class JsonArrIndexCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.ARRINDEX", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.arrinsert
 */
class JsonArrInsertCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.ARRINSERT", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.arrlen
 */
class JsonArrLenCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.ARRLEN", cmd[0], cmd[1] ?? "$"], opts);
    }
}

/**
 * @see https://redis.io/commands/json.arrpop
 */
class JsonArrPopCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.ARRPOP", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.arrtrim
 */
class JsonArrTrimCommand extends Command {
    constructor(cmd, opts) {
        const path = cmd[1] ?? "$";
        const start = cmd[2] ?? 0;
        const stop = cmd[3] ?? 0;
        super(["JSON.ARRTRIM", cmd[0], path, start, stop], opts);
    }
}

/**
 * @see https://redis.io/commands/json.clear
 */
class JsonClearCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.CLEAR", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.del
 */
class JsonDelCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.DEL", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.forget
 */
class JsonForgetCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.FORGET", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.get
 */
class JsonGetCommand extends Command {
    constructor(cmd, opts) {
        const command = ["JSON.GET"];
        if (typeof cmd[1] === "string") {
            // @ts-ignore - we know this is a string
            command.push(...cmd);
        }
        else {
            command.push(cmd[0]);
            if (cmd[1]) {
                if (cmd[1].indent) {
                    command.push("INDENT", cmd[1].indent);
                }
                if (cmd[1].newline) {
                    command.push("NEWLINE", cmd[1].newline);
                }
                if (cmd[1].space) {
                    command.push("SPACE", cmd[1].space);
                }
            }
            // @ts-ignore - we know this is a string
            command.push(...cmd.slice(2));
        }
        super(command, opts);
    }
}

/**
 * @see https://redis.io/commands/json.mget
 */
class JsonMGetCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.MGET", ...cmd[0], cmd[1]], opts);
    }
}

/**
 * @see https://redis.io/commands/json.numincrby
 */
class JsonNumIncrByCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.NUMINCRBY", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.nummultby
 */
class JsonNumMultByCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.NUMMULTBY", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.objkeys
 */
class JsonObjKeysCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.OBJKEYS", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.objlen
 */
class JsonObjLenCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.OBJLEN", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.resp
 */
class JsonRespCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.RESP", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.set
 */
class JsonSetCommand extends Command {
    constructor(cmd, opts) {
        const command = ["JSON.SET", cmd[0], cmd[1], cmd[2]];
        if (cmd[3]) {
            if (cmd[3].nx) {
                command.push("NX");
            }
            else if (cmd[3].xx) {
                command.push("XX");
            }
        }
        super(command, opts);
    }
}

/**
 * @see https://redis.io/commands/json.strappend
 */
class JsonStrAppendCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.STRAPPEND", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.strlen
 */
class JsonStrLenCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.STRLEN", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.toggle
 */
class JsonToggleCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.TOGGLE", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/json.type
 */
class JsonTypeCommand extends Command {
    constructor(cmd, opts) {
        super(["JSON.TYPE", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/keys
 */
class KeysCommand extends Command {
    constructor(cmd, opts) {
        super(["keys", ...cmd], opts);
    }
}

class LIndexCommand extends Command {
    constructor(cmd, opts) {
        super(["lindex", ...cmd], opts);
    }
}

class LInsertCommand extends Command {
    constructor(cmd, opts) {
        super(["linsert", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/llen
 */
class LLenCommand extends Command {
    constructor(cmd, opts) {
        super(["llen", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/lmove
 */
class LMoveCommand extends Command {
    constructor(cmd, opts) {
        super(["lmove", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/lpop
 */
class LPopCommand extends Command {
    constructor(cmd, opts) {
        super(["lpop", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/lpos
 */
class LPosCommand extends Command {
    constructor(cmd, opts) {
        const args = ["lpos", cmd[0], cmd[1]];
        if (typeof cmd[2]?.rank === "number") {
            args.push("rank", cmd[2].rank);
        }
        if (typeof cmd[2]?.count === "number") {
            args.push("count", cmd[2].count);
        }
        if (typeof cmd[2]?.maxLen === "number") {
            args.push("maxLen", cmd[2].maxLen);
        }
        super(args, opts);
    }
}

/**
 * @see https://redis.io/commands/lpush
 */
class LPushCommand extends Command {
    constructor(cmd, opts) {
        super(["lpush", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/lpushx
 */
class LPushXCommand extends Command {
    constructor(cmd, opts) {
        super(["lpushx", ...cmd], opts);
    }
}

class LRangeCommand extends Command {
    constructor(cmd, opts) {
        super(["lrange", ...cmd], opts);
    }
}

class LRemCommand extends Command {
    constructor(cmd, opts) {
        super(["lrem", ...cmd], opts);
    }
}

class LSetCommand extends Command {
    constructor(cmd, opts) {
        super(["lset", ...cmd], opts);
    }
}

class LTrimCommand extends Command {
    constructor(cmd, opts) {
        super(["ltrim", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/mget
 */
class MGetCommand extends Command {
    constructor(cmd, opts) {
        super(["mget", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/mset
 */
class MSetCommand extends Command {
    constructor([kv], opts) {
        super([
            "mset",
            ...Object.entries(kv).flatMap(([key, value]) => [key, value]),
        ], opts);
    }
}

/**
 * @see https://redis.io/commands/msetnx
 */
class MSetNXCommand extends Command {
    constructor([kv], opts) {
        super(["msetnx", ...Object.entries(kv).flatMap((_) => _)], opts);
    }
}

/**
 * @see https://redis.io/commands/persist
 */
class PersistCommand extends Command {
    constructor(cmd, opts) {
        super(["persist", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/pexpire
 */
class PExpireCommand extends Command {
    constructor(cmd, opts) {
        super(["pexpire", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/pexpireat
 */
class PExpireAtCommand extends Command {
    constructor(cmd, opts) {
        super(["pexpireat", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/ping
 */
class PingCommand extends Command {
    constructor(cmd, opts) {
        const command = ["ping"];
        if (typeof cmd !== "undefined" && typeof cmd[0] !== "undefined") {
            command.push(cmd[0]);
        }
        super(command, opts);
    }
}

/**
 * @see https://redis.io/commands/psetex
 */
class PSetEXCommand extends Command {
    constructor(cmd, opts) {
        super(["psetex", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/pttl
 */
class PTtlCommand extends Command {
    constructor(cmd, opts) {
        super(["pttl", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/publish
 */
class PublishCommand extends Command {
    constructor(cmd, opts) {
        super(["publish", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/randomkey
 */
class RandomKeyCommand extends Command {
    constructor(opts) {
        super(["randomkey"], opts);
    }
}

/**
 * @see https://redis.io/commands/rename
 */
class RenameCommand extends Command {
    constructor(cmd, opts) {
        super(["rename", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/renamenx
 */
class RenameNXCommand extends Command {
    constructor(cmd, opts) {
        super(["renamenx", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/rpop
 */
class RPopCommand extends Command {
    constructor(cmd, opts) {
        super(["rpop", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/rpush
 */
class RPushCommand extends Command {
    constructor(cmd, opts) {
        super(["rpush", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/rpushx
 */
class RPushXCommand extends Command {
    constructor(cmd, opts) {
        super(["rpushx", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/sadd
 */
class SAddCommand extends Command {
    constructor(cmd, opts) {
        super(["sadd", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/scan
 */
class ScanCommand extends Command {
    constructor([cursor, opts], cmdOpts) {
        const command = ["scan", cursor];
        if (opts?.match) {
            command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
            command.push("count", opts.count);
        }
        if (opts?.type && opts.type.length > 0) {
            command.push("type", opts.type);
        }
        super(command, cmdOpts);
    }
}

/**
 * @see https://redis.io/commands/scard
 */
class SCardCommand extends Command {
    constructor(cmd, opts) {
        super(["scard", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/script-exists
 */
class ScriptExistsCommand extends Command {
    constructor(hashes, opts) {
        super(["script", "exists", ...hashes], {
            deserialize: (result) => result,
            ...opts,
        });
    }
}

/**
 * @see https://redis.io/commands/script-flush
 */
class ScriptFlushCommand extends Command {
    constructor([opts], cmdOpts) {
        const cmd = ["script", "flush"];
        if (opts?.sync) {
            cmd.push("sync");
        }
        else if (opts?.async) {
            cmd.push("async");
        }
        super(cmd, cmdOpts);
    }
}

/**
 * @see https://redis.io/commands/script-load
 */
class ScriptLoadCommand extends Command {
    constructor(args, opts) {
        super(["script", "load", ...args], opts);
    }
}

/**
 * @see https://redis.io/commands/sdiff
 */
class SDiffCommand extends Command {
    constructor(cmd, opts) {
        super(["sdiff", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/sdiffstore
 */
class SDiffStoreCommand extends Command {
    constructor(cmd, opts) {
        super(["sdiffstore", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/set
 */
class SetCommand extends Command {
    constructor([key, value, opts], cmdOpts) {
        const command = ["set", key, value];
        if (opts) {
            if ("nx" in opts && opts.nx) {
                command.push("nx");
            }
            else if ("xx" in opts && opts.xx) {
                command.push("xx");
            }
            if ("get" in opts && opts.get) {
                command.push("get");
            }
            if ("ex" in opts && typeof opts.ex === "number") {
                command.push("ex", opts.ex);
            }
            else if ("px" in opts && typeof opts.px === "number") {
                command.push("px", opts.px);
            }
            else if ("exat" in opts && typeof opts.exat === "number") {
                command.push("exat", opts.exat);
            }
            else if ("pxat" in opts && typeof opts.pxat === "number") {
                command.push("pxat", opts.pxat);
            }
            else if ("keepTtl" in opts && opts.keepTtl) {
                command.push("keepTtl", opts.keepTtl);
            }
        }
        super(command, cmdOpts);
    }
}

/**
 * @see https://redis.io/commands/setbit
 */
class SetBitCommand extends Command {
    constructor(cmd, opts) {
        super(["setbit", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/setex
 */
class SetExCommand extends Command {
    constructor(cmd, opts) {
        super(["setex", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/setnx
 */
class SetNxCommand extends Command {
    constructor(cmd, opts) {
        super(["setnx", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/setrange
 */
class SetRangeCommand extends Command {
    constructor(cmd, opts) {
        super(["setrange", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/sinter
 */
class SInterCommand extends Command {
    constructor(cmd, opts) {
        super(["sinter", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/sinterstore
 */
class SInterStoreCommand extends Command {
    constructor(cmd, opts) {
        super(["sinterstore", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/sismember
 */
class SIsMemberCommand extends Command {
    constructor(cmd, opts) {
        super(["sismember", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/smembers
 */
class SMembersCommand extends Command {
    constructor(cmd, opts) {
        super(["smembers", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/smismember
 */
class SMIsMemberCommand extends Command {
    constructor(cmd, opts) {
        super(["smismember", cmd[0], ...cmd[1]], opts);
    }
}

/**
 * @see https://redis.io/commands/smove
 */
class SMoveCommand extends Command {
    constructor(cmd, opts) {
        super(["smove", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/spop
 */
class SPopCommand extends Command {
    constructor([key, count], opts) {
        const command = ["spop", key];
        if (typeof count === "number") {
            command.push(count);
        }
        super(command, opts);
    }
}

/**
 * @see https://redis.io/commands/srandmember
 */
class SRandMemberCommand extends Command {
    constructor([key, count], opts) {
        const command = ["srandmember", key];
        if (typeof count === "number") {
            command.push(count);
        }
        super(command, opts);
    }
}

/**
 * @see https://redis.io/commands/srem
 */
class SRemCommand extends Command {
    constructor(cmd, opts) {
        super(["srem", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/sscan
 */
class SScanCommand extends Command {
    constructor([key, cursor, opts], cmdOpts) {
        const command = ["sscan", key, cursor];
        if (opts?.match) {
            command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
            command.push("count", opts.count);
        }
        super(command, cmdOpts);
    }
}

/**
 * @see https://redis.io/commands/strlen
 */
class StrLenCommand extends Command {
    constructor(cmd, opts) {
        super(["strlen", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/sunion
 */
class SUnionCommand extends Command {
    constructor(cmd, opts) {
        super(["sunion", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/sunionstore
 */
class SUnionStoreCommand extends Command {
    constructor(cmd, opts) {
        super(["sunionstore", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/time
 */
class TimeCommand extends Command {
    constructor(opts) {
        super(["time"], opts);
    }
}

/**
 * @see https://redis.io/commands/touch
 */
class TouchCommand extends Command {
    constructor(cmd, opts) {
        super(["touch", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/ttl
 */
class TtlCommand extends Command {
    constructor(cmd, opts) {
        super(["ttl", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/type
 */
class TypeCommand extends Command {
    constructor(cmd, opts) {
        super(["type", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/unlink
 */
class UnlinkCommand extends Command {
    constructor(cmd, opts) {
        super(["unlink", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/zadd
 */
class ZAddCommand extends Command {
    constructor([key, arg1, ...arg2], opts) {
        const command = ["zadd", key];
        if ("nx" in arg1 && arg1.nx) {
            command.push("nx");
        }
        else if ("xx" in arg1 && arg1.xx) {
            command.push("xx");
        }
        if ("ch" in arg1 && arg1.ch) {
            command.push("ch");
        }
        if ("incr" in arg1 && arg1.incr) {
            command.push("incr");
        }
        if ("score" in arg1 && "member" in arg1) {
            command.push(arg1.score, arg1.member);
        }
        command.push(...arg2.flatMap(({ score, member }) => [score, member]));
        super(command, opts);
    }
}

/**
 * @see https://redis.io/commands/zcard
 */
class ZCardCommand extends Command {
    constructor(cmd, opts) {
        super(["zcard", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/zcount
 */
class ZCountCommand extends Command {
    constructor(cmd, opts) {
        super(["zcount", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/zincrby
 */
class ZIncrByCommand extends Command {
    constructor(cmd, opts) {
        super(["zincrby", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/zInterstore
 */
class ZInterStoreCommand extends Command {
    constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
        const command = ["zinterstore", destination, numKeys];
        if (Array.isArray(keyOrKeys)) {
            command.push(...keyOrKeys);
        }
        else {
            command.push(keyOrKeys);
        }
        if (opts) {
            if ("weights" in opts && opts.weights) {
                command.push("weights", ...opts.weights);
            }
            else if ("weight" in opts && typeof opts.weight === "number") {
                command.push("weights", opts.weight);
            }
            if ("aggregate" in opts) {
                command.push("aggregate", opts.aggregate);
            }
        }
        super(command, cmdOpts);
    }
}

/**
 * @see https://redis.io/commands/zlexcount
 */
class ZLexCountCommand extends Command {
    constructor(cmd, opts) {
        super(["zlexcount", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/zpopmax
 */
class ZPopMaxCommand extends Command {
    constructor([key, count], opts) {
        const command = ["zpopmax", key];
        if (typeof count === "number") {
            command.push(count);
        }
        super(command, opts);
    }
}

/**
 * @see https://redis.io/commands/zpopmin
 */
class ZPopMinCommand extends Command {
    constructor([key, count], opts) {
        const command = ["zpopmin", key];
        if (typeof count === "number") {
            command.push(count);
        }
        super(command, opts);
    }
}

/**
 * @see https://redis.io/commands/zrange
 */
class ZRangeCommand extends Command {
    constructor([key, min, max, opts], cmdOpts) {
        const command = ["zrange", key, min, max];
        // Either byScore or byLex is allowed
        if (opts?.byScore) {
            command.push("byscore");
        }
        if (opts?.byLex) {
            command.push("bylex");
        }
        if (opts?.rev) {
            command.push("rev");
        }
        if (typeof opts?.count !== "undefined" && typeof opts?.offset !== "undefined") {
            command.push("limit", opts.offset, opts.count);
        }
        if (opts?.withScores) {
            command.push("withscores");
        }
        super(command, cmdOpts);
    }
}

/**
 *  @see https://redis.io/commands/zrank
 */
class ZRankCommand extends Command {
    constructor(cmd, opts) {
        super(["zrank", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/zrem
 */
class ZRemCommand extends Command {
    constructor(cmd, opts) {
        super(["zrem", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/zremrangebylex
 */
class ZRemRangeByLexCommand extends Command {
    constructor(cmd, opts) {
        super(["zremrangebylex", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/zremrangebyrank
 */
class ZRemRangeByRankCommand extends Command {
    constructor(cmd, opts) {
        super(["zremrangebyrank", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/zremrangebyscore
 */
class ZRemRangeByScoreCommand extends Command {
    constructor(cmd, opts) {
        super(["zremrangebyscore", ...cmd], opts);
    }
}

/**
 *  @see https://redis.io/commands/zrevrank
 */
class ZRevRankCommand extends Command {
    constructor(cmd, opts) {
        super(["zrevrank", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/zscan
 */
class ZScanCommand extends Command {
    constructor([key, cursor, opts], cmdOpts) {
        const command = ["zscan", key, cursor];
        if (opts?.match) {
            command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
            command.push("count", opts.count);
        }
        super(command, cmdOpts);
    }
}

/**
 * @see https://redis.io/commands/zscore
 */
class ZScoreCommand extends Command {
    constructor(cmd, opts) {
        super(["zscore", ...cmd], opts);
    }
}

/**
 * @see https://redis.io/commands/zunionstore
 */
class ZUnionStoreCommand extends Command {
    constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
        const command = ["zunionstore", destination, numKeys];
        if (Array.isArray(keyOrKeys)) {
            command.push(...keyOrKeys);
        }
        else {
            command.push(keyOrKeys);
        }
        if (opts) {
            if ("weights" in opts && opts.weights) {
                command.push("weights", ...opts.weights);
            }
            else if ("weight" in opts && typeof opts.weight === "number") {
                command.push("weights", opts.weight);
            }
            if ("aggregate" in opts) {
                command.push("aggregate", opts.aggregate);
            }
        }
        super(command, cmdOpts);
    }
}

/**
 * @see https://redis.io/commands/zmscore
 */
class ZMScoreCommand extends Command {
    constructor(cmd, opts) {
        const [key, members] = cmd;
        super(["zmscore", key, ...members], opts);
    }
}

/**
 * @see https://redis.io/commands/zdiffstore
 */
class ZDiffStoreCommand extends Command {
    constructor(cmd, opts) {
        super(["zdiffstore", ...cmd], opts);
    }
}

/**
 * Upstash REST API supports command pipelining to send multiple commands in
 * batch, instead of sending each command one by one and waiting for a response.
 * When using pipelines, several commands are sent using a single HTTP request,
 * and a single JSON array response is returned. Each item in the response array
 * corresponds to the command in the same order within the pipeline.
 *
 * **NOTE:**
 *
 * Execution of the pipeline is not atomic. Even though each command in
 * the pipeline will be executed in order, commands sent by other clients can
 * interleave with the pipeline.
 *
 * **Examples:**
 *
 * ```ts
 *  const p = redis.pipeline() // or redis.multi()
 * p.set("key","value")
 * p.get("key")
 * const res = await p.exec()
 * ```
 *
 * You can also chain commands together
 * ```ts
 * const p = redis.pipeline()
 * const res = await p.set("key","value").get("key").exec()
 * ```
 *
 * Return types are inferred if all commands are chained, but you can still
 * override the response type manually:
 * ```ts
 *  redis.pipeline()
 *   .set("key", { greeting: "hello"})
 *   .get("key")
 *   .exec<["OK", { greeting: string } ]>()
 *
 * ```
 */
class Pipeline {
    constructor(opts) {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "commands", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "commandOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "multiExec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Send the pipeline request to upstash.
         *
         * Returns an array with the results of all pipelined commands.
         *
         * If all commands are statically chained from start to finish, types are inferred. You can still define a return type manually if necessary though:
         * ```ts
         * const p = redis.pipeline()
         * p.get("key")
         * const result = p.exec<[{ greeting: string }]>()
         * ```
         */
        Object.defineProperty(this, "exec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => {
                if (this.commands.length === 0) {
                    throw new Error("Pipeline is empty");
                }
                const path = this.multiExec ? ["multi-exec"] : ["pipeline"];
                const res = (await this.client.request({
                    path,
                    body: Object.values(this.commands).map((c) => c.command),
                }));
                return res.map(({ error, result }, i) => {
                    if (error) {
                        throw new UpstashError(`Command ${i + 1} [ ${this.commands[i].command[0]} ] failed: ${error}`);
                    }
                    return this.commands[i].deserialize(result);
                });
            }
        });
        /**
         * @see https://redis.io/commands/append
         */
        Object.defineProperty(this, "append", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new AppendCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/bitcount
         */
        Object.defineProperty(this, "bitcount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new BitCountCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/bitop
         */
        Object.defineProperty(this, "bitop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (op, destinationKey, sourceKey, ...sourceKeys) => this.chain(new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/bitpos
         */
        Object.defineProperty(this, "bitpos", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new BitPosCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zdiffstore
         */
        Object.defineProperty(this, "zdiffstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZDiffStoreCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/dbsize
         */
        Object.defineProperty(this, "dbsize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => this.chain(new DBSizeCommand(this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/decr
         */
        Object.defineProperty(this, "decr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new DecrCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/decrby
         */
        Object.defineProperty(this, "decrby", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new DecrByCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/del
         */
        Object.defineProperty(this, "del", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new DelCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/echo
         */
        Object.defineProperty(this, "echo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new EchoCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/eval
         */
        Object.defineProperty(this, "eval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new EvalCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/evalsha
         */
        Object.defineProperty(this, "evalsha", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new EvalshaCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/exists
         */
        Object.defineProperty(this, "exists", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ExistsCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/expire
         */
        Object.defineProperty(this, "expire", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ExpireCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/expireat
         */
        Object.defineProperty(this, "expireat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ExpireAtCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/flushall
         */
        Object.defineProperty(this, "flushall", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (args) => this.chain(new FlushAllCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/flushdb
         */
        Object.defineProperty(this, "flushdb", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new FlushDBCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/get
         */
        Object.defineProperty(this, "get", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new GetCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/getbit
         */
        Object.defineProperty(this, "getbit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new GetBitCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/getdel
         */
        Object.defineProperty(this, "getdel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new GetDelCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/getrange
         */
        Object.defineProperty(this, "getrange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new GetRangeCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/getset
         */
        Object.defineProperty(this, "getset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, value) => this.chain(new GetSetCommand([key, value], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hdel
         */
        Object.defineProperty(this, "hdel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HDelCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hexists
         */
        Object.defineProperty(this, "hexists", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HExistsCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hget
         */
        Object.defineProperty(this, "hget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HGetCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hgetall
         */
        Object.defineProperty(this, "hgetall", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HGetAllCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hincrby
         */
        Object.defineProperty(this, "hincrby", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HIncrByCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hincrbyfloat
         */
        Object.defineProperty(this, "hincrbyfloat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HIncrByFloatCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hkeys
         */
        Object.defineProperty(this, "hkeys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HKeysCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hlen
         */
        Object.defineProperty(this, "hlen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HLenCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hmget
         */
        Object.defineProperty(this, "hmget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HMGetCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hmset
         */
        Object.defineProperty(this, "hmset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, kv) => this.chain(new HMSetCommand([key, kv], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hrandfield
         */
        Object.defineProperty(this, "hrandfield", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, count, withValues) => this.chain(new HRandFieldCommand([key, count, withValues], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hscan
         */
        Object.defineProperty(this, "hscan", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HScanCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hset
         */
        Object.defineProperty(this, "hset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, kv) => this.chain(new HSetCommand([key, kv], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hsetnx
         */
        Object.defineProperty(this, "hsetnx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, field, value) => this.chain(new HSetNXCommand([key, field, value], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hstrlen
         */
        Object.defineProperty(this, "hstrlen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HStrLenCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/hvals
         */
        Object.defineProperty(this, "hvals", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new HValsCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/incr
         */
        Object.defineProperty(this, "incr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new IncrCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/incrby
         */
        Object.defineProperty(this, "incrby", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new IncrByCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/incrbyfloat
         */
        Object.defineProperty(this, "incrbyfloat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new IncrByFloatCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/keys
         */
        Object.defineProperty(this, "keys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new KeysCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/lindex
         */
        Object.defineProperty(this, "lindex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new LIndexCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/linsert
         */
        Object.defineProperty(this, "linsert", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, direction, pivot, value) => this.chain(new LInsertCommand([key, direction, pivot, value], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/llen
         */
        Object.defineProperty(this, "llen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new LLenCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/lmove
         */
        Object.defineProperty(this, "lmove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new LMoveCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/lpop
         */
        Object.defineProperty(this, "lpop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new LPopCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/lpos
         */
        Object.defineProperty(this, "lpos", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new LPosCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/lpush
         */
        Object.defineProperty(this, "lpush", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...elements) => this.chain(new LPushCommand([key, ...elements], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/lpushx
         */
        Object.defineProperty(this, "lpushx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...elements) => this.chain(new LPushXCommand([key, ...elements], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/lrange
         */
        Object.defineProperty(this, "lrange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new LRangeCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/lrem
         */
        Object.defineProperty(this, "lrem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, count, value) => this.chain(new LRemCommand([key, count, value], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/lset
         */
        Object.defineProperty(this, "lset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, index, value) => this.chain(new LSetCommand([key, index, value], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/ltrim
         */
        Object.defineProperty(this, "ltrim", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new LTrimCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/mget
         */
        Object.defineProperty(this, "mget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new MGetCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/mset
         */
        Object.defineProperty(this, "mset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (kv) => this.chain(new MSetCommand([kv], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/msetnx
         */
        Object.defineProperty(this, "msetnx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (kv) => this.chain(new MSetNXCommand([kv], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/persist
         */
        Object.defineProperty(this, "persist", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new PersistCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/pexpire
         */
        Object.defineProperty(this, "pexpire", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new PExpireCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/pexpireat
         */
        Object.defineProperty(this, "pexpireat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new PExpireAtCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/ping
         */
        Object.defineProperty(this, "ping", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (args) => this.chain(new PingCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/psetex
         */
        Object.defineProperty(this, "psetex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ttl, value) => this.chain(new PSetEXCommand([key, ttl, value], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/pttl
         */
        Object.defineProperty(this, "pttl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new PTtlCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/publish
         */
        Object.defineProperty(this, "publish", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new PublishCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/randomkey
         */
        Object.defineProperty(this, "randomkey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => this.chain(new RandomKeyCommand(this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/rename
         */
        Object.defineProperty(this, "rename", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new RenameCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/renamenx
         */
        Object.defineProperty(this, "renamenx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new RenameNXCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/rpop
         */
        Object.defineProperty(this, "rpop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new RPopCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/rpush
         */
        Object.defineProperty(this, "rpush", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...elements) => this.chain(new RPushCommand([key, ...elements], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/rpushx
         */
        Object.defineProperty(this, "rpushx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...elements) => this.chain(new RPushXCommand([key, ...elements], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/sadd
         */
        Object.defineProperty(this, "sadd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...members) => this.chain(new SAddCommand([key, ...members], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/scan
         */
        Object.defineProperty(this, "scan", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ScanCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/scard
         */
        Object.defineProperty(this, "scard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SCardCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/script-exists
         */
        Object.defineProperty(this, "scriptExists", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ScriptExistsCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/script-flush
         */
        Object.defineProperty(this, "scriptFlush", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ScriptFlushCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/script-load
         */
        Object.defineProperty(this, "scriptLoad", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ScriptLoadCommand(args, this.commandOptions))
        });
        /*)*
         * @see https://redis.io/commands/sdiff
         */
        Object.defineProperty(this, "sdiff", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SDiffCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/sdiffstore
         */
        Object.defineProperty(this, "sdiffstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SDiffStoreCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/set
         */
        Object.defineProperty(this, "set", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, value, opts) => this.chain(new SetCommand([key, value, opts], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/setbit
         */
        Object.defineProperty(this, "setbit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SetBitCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/setex
         */
        Object.defineProperty(this, "setex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ttl, value) => this.chain(new SetExCommand([key, ttl, value], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/setnx
         */
        Object.defineProperty(this, "setnx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, value) => this.chain(new SetNxCommand([key, value], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/setrange
         */
        Object.defineProperty(this, "setrange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SetRangeCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/sinter
         */
        Object.defineProperty(this, "sinter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SInterCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/sinterstore
         */
        Object.defineProperty(this, "sinterstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SInterStoreCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/sismember
         */
        Object.defineProperty(this, "sismember", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, member) => this.chain(new SIsMemberCommand([key, member], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/smembers
         */
        Object.defineProperty(this, "smembers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SMembersCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/smismember
         */
        Object.defineProperty(this, "smismember", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, members) => this.chain(new SMIsMemberCommand([key, members], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/smove
         */
        Object.defineProperty(this, "smove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (source, destination, member) => this.chain(new SMoveCommand([source, destination, member], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/spop
         */
        Object.defineProperty(this, "spop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SPopCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/srandmember
         */
        Object.defineProperty(this, "srandmember", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SRandMemberCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/srem
         */
        Object.defineProperty(this, "srem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...members) => this.chain(new SRemCommand([key, ...members], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/sscan
         */
        Object.defineProperty(this, "sscan", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SScanCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/strlen
         */
        Object.defineProperty(this, "strlen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new StrLenCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/sunion
         */
        Object.defineProperty(this, "sunion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SUnionCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/sunionstore
         */
        Object.defineProperty(this, "sunionstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new SUnionStoreCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/time
         */
        Object.defineProperty(this, "time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => this.chain(new TimeCommand(this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/touch
         */
        Object.defineProperty(this, "touch", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new TouchCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/ttl
         */
        Object.defineProperty(this, "ttl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new TtlCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/type
         */
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new TypeCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/unlink
         */
        Object.defineProperty(this, "unlink", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new UnlinkCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zadd
         */
        Object.defineProperty(this, "zadd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => {
                if ("score" in args[1]) {
                    return this.chain(new ZAddCommand([args[0], args[1], ...args.slice(2)], this.commandOptions));
                }
                return this.chain(new ZAddCommand([args[0], args[1], ...args.slice(2)], this.commandOptions));
            }
        });
        /**
         * @see https://redis.io/commands/zcard
         */
        Object.defineProperty(this, "zcard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZCardCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zcount
         */
        Object.defineProperty(this, "zcount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZCountCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zincrby
         */
        Object.defineProperty(this, "zincrby", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, increment, member) => this.chain(new ZIncrByCommand([key, increment, member], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zinterstore
         */
        Object.defineProperty(this, "zinterstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZInterStoreCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zlexcount
         */
        Object.defineProperty(this, "zlexcount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZLexCountCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zmscore
         */
        Object.defineProperty(this, "zmscore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZMScoreCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zpopmax
         */
        Object.defineProperty(this, "zpopmax", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZPopMaxCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zpopmin
         */
        Object.defineProperty(this, "zpopmin", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZPopMinCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zrange
         */
        Object.defineProperty(this, "zrange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZRangeCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zrank
         */
        Object.defineProperty(this, "zrank", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, member) => this.chain(new ZRankCommand([key, member], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zrem
         */
        Object.defineProperty(this, "zrem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...members) => this.chain(new ZRemCommand([key, ...members], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zremrangebylex
         */
        Object.defineProperty(this, "zremrangebylex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZRemRangeByLexCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zremrangebyrank
         */
        Object.defineProperty(this, "zremrangebyrank", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZRemRangeByRankCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zremrangebyscore
         */
        Object.defineProperty(this, "zremrangebyscore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZRemRangeByScoreCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zrevrank
         */
        Object.defineProperty(this, "zrevrank", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, member) => this.chain(new ZRevRankCommand([key, member], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zscan
         */
        Object.defineProperty(this, "zscan", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZScanCommand(args, this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zscore
         */
        Object.defineProperty(this, "zscore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, member) => this.chain(new ZScoreCommand([key, member], this.commandOptions))
        });
        /**
         * @see https://redis.io/commands/zunionstore
         */
        Object.defineProperty(this, "zunionstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => this.chain(new ZUnionStoreCommand(args, this.commandOptions))
        });
        this.client = opts.client;
        this.commands = []; // the TCommands generic in the class definition is only used for carrying through chained command types and should never be explicitly set when instantiating the class
        this.commandOptions = opts.commandOptions;
        this.multiExec = opts.multiExec ?? false;
    }
    /**
     * Pushes a command into the pipeline and returns a chainable instance of the
     * pipeline
     */
    chain(command) {
        this.commands.push(command);
        return this; // TS thinks we're returning Pipeline<[]> here, because we're not creating a new instance of the class, hence the cast
    }
    /**
     * @see https://redis.io/commands/?group=json
     */
    get json() {
        return {
            /**
             * @see https://redis.io/commands/json.arrappend
             */
            arrappend: (...args) => this.chain(new JsonArrAppendCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.arrindex
             */
            arrindex: (...args) => this.chain(new JsonArrIndexCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.arrinsert
             */
            arrinsert: (...args) => this.chain(new JsonArrInsertCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.arrlen
             */
            arrlen: (...args) => this.chain(new JsonArrLenCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.arrpop
             */
            arrpop: (...args) => this.chain(new JsonArrPopCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.arrtrim
             */
            arrtrim: (...args) => this.chain(new JsonArrTrimCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.clear
             */
            clear: (...args) => this.chain(new JsonClearCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.del
             */
            del: (...args) => this.chain(new JsonDelCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.forget
             */
            forget: (...args) => this.chain(new JsonForgetCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.get
             */
            get: (...args) => this.chain(new JsonGetCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.mget
             */
            mget: (...args) => this.chain(new JsonMGetCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.numincrby
             */
            numincrby: (...args) => this.chain(new JsonNumIncrByCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.nummultby
             */
            nummultby: (...args) => this.chain(new JsonNumMultByCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.objkeys
             */
            objkeys: (...args) => this.chain(new JsonObjKeysCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.objlen
             */
            objlen: (...args) => this.chain(new JsonObjLenCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.resp
             */
            resp: (...args) => this.chain(new JsonRespCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.set
             */
            set: (...args) => this.chain(new JsonSetCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.strappend
             */
            strappend: (...args) => this.chain(new JsonStrAppendCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.strlen
             */
            strlen: (...args) => this.chain(new JsonStrLenCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.toggle
             */
            toggle: (...args) => this.chain(new JsonToggleCommand(args, this.commandOptions)),
            /**
             * @see https://redis.io/commands/json.type
             */
            type: (...args) => this.chain(new JsonTypeCommand(args, this.commandOptions)),
        };
    }
}

function getLengths(b64) {
    const len = b64.length;
    // if (len % 4 > 0) {
    //   throw new TypeError("Invalid string. Length must be a multiple of 4");
    // }
    // Trim off extra bytes after placeholder bytes are found
    // See: https://github.com/beatgammit/base64-js/issues/42
    let validLen = b64.indexOf("=");
    if (validLen === -1) {
        validLen = len;
    }
    const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
    return [validLen, placeHoldersLen];
}
function init(lookup, revLookup, urlsafe = false) {
    function _byteLength(validLen, placeHoldersLen) {
        return Math.floor(((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen);
    }
    function tripletToBase64(num) {
        return (lookup[(num >> 18) & 0x3f] +
            lookup[(num >> 12) & 0x3f] +
            lookup[(num >> 6) & 0x3f] +
            lookup[num & 0x3f]);
    }
    function encodeChunk(buf, start, end) {
        const out = new Array((end - start) / 3);
        for (let i = start, curTriplet = 0; i < end; i += 3) {
            out[curTriplet++] = tripletToBase64((buf[i] << 16) + (buf[i + 1] << 8) + buf[i + 2]);
        }
        return out.join("");
    }
    return {
        // base64 is 4/3 + up to two characters of the original data
        byteLength(b64) {
            return _byteLength.apply(null, getLengths(b64));
        },
        toUint8Array(b64) {
            const [validLen, placeHoldersLen] = getLengths(b64);
            const buf = new Uint8Array(_byteLength(validLen, placeHoldersLen));
            // If there are placeholders, only get up to the last complete 4 chars
            const len = placeHoldersLen ? validLen - 4 : validLen;
            let tmp;
            let curByte = 0;
            let i;
            for (i = 0; i < len; i += 4) {
                tmp = (revLookup[b64.charCodeAt(i)] << 18) |
                    (revLookup[b64.charCodeAt(i + 1)] << 12) |
                    (revLookup[b64.charCodeAt(i + 2)] << 6) |
                    revLookup[b64.charCodeAt(i + 3)];
                buf[curByte++] = (tmp >> 16) & 0xff;
                buf[curByte++] = (tmp >> 8) & 0xff;
                buf[curByte++] = tmp & 0xff;
            }
            if (placeHoldersLen === 2) {
                tmp = (revLookup[b64.charCodeAt(i)] << 2) |
                    (revLookup[b64.charCodeAt(i + 1)] >> 4);
                buf[curByte++] = tmp & 0xff;
            }
            else if (placeHoldersLen === 1) {
                tmp = (revLookup[b64.charCodeAt(i)] << 10) |
                    (revLookup[b64.charCodeAt(i + 1)] << 4) |
                    (revLookup[b64.charCodeAt(i + 2)] >> 2);
                buf[curByte++] = (tmp >> 8) & 0xff;
                buf[curByte++] = tmp & 0xff;
            }
            return buf;
        },
        fromUint8Array(buf) {
            const maxChunkLength = 16383; // Must be multiple of 3
            const len = buf.length;
            const extraBytes = len % 3; // If we have 1 byte left, pad 2 bytes
            const len2 = len - extraBytes;
            const parts = new Array(Math.ceil(len2 / maxChunkLength) + (extraBytes ? 1 : 0));
            let curChunk = 0;
            let chunkEnd;
            // Go through the array every three bytes, we'll deal with trailing stuff later
            for (let i = 0; i < len2; i += maxChunkLength) {
                chunkEnd = i + maxChunkLength;
                parts[curChunk++] = encodeChunk(buf, i, chunkEnd > len2 ? len2 : chunkEnd);
            }
            let tmp;
            // Pad the end with zeros, but make sure to not forget the extra bytes
            if (extraBytes === 1) {
                tmp = buf[len2];
                parts[curChunk] = lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f];
                if (!urlsafe)
                    parts[curChunk] += "==";
            }
            else if (extraBytes === 2) {
                tmp = (buf[len2] << 8) | (buf[len2 + 1] & 0xff);
                parts[curChunk] = lookup[tmp >> 10] +
                    lookup[(tmp >> 4) & 0x3f] +
                    lookup[(tmp << 2) & 0x3f];
                if (!urlsafe)
                    parts[curChunk] += "=";
            }
            return parts.join("");
        },
    };
}

const lookup = [];
const revLookup = [];
const code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
for (let i = 0, l = code.length; i < l; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
}
const { byteLength, toUint8Array, fromUint8Array } = init(lookup, revLookup, true);

const decoder = new TextDecoder();
const encoder = new TextEncoder();
/** Serializes a Uint8Array to a hexadecimal string. */
function toHexString(buf) {
    return buf.reduce((hex, byte) => `${hex}${byte < 16 ? "0" : ""}${byte.toString(16)}`, "");
}
/** Deserializes a Uint8Array from a hexadecimal string. */
function fromHexString(hex) {
    const len = hex.length;
    if (len % 2 || !/^[0-9a-fA-F]+$/.test(hex)) {
        throw new TypeError("Invalid hex string.");
    }
    hex = hex.toLowerCase();
    const buf = new Uint8Array(Math.floor(len / 2));
    const end = len / 2;
    for (let i = 0; i < end; ++i) {
        buf[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return buf;
}
/** Decodes a Uint8Array to utf8-, base64-, or hex-encoded string. */
function decode$1(buf, encoding = "utf8") {
    if (/^utf-?8$/i.test(encoding)) {
        return decoder.decode(buf);
    }
    else if (/^base64$/i.test(encoding)) {
        return fromUint8Array(buf);
    }
    else if (/^hex(?:adecimal)?$/i.test(encoding)) {
        return toHexString(buf);
    }
    else {
        throw new TypeError("Unsupported string encoding.");
    }
}
function encode(str, encoding = "utf8") {
    if (/^utf-?8$/i.test(encoding)) {
        return encoder.encode(str);
    }
    else if (/^base64$/i.test(encoding)) {
        return toUint8Array(str);
    }
    else if (/^hex(?:adecimal)?$/i.test(encoding)) {
        return fromHexString(str);
    }
    else {
        throw new TypeError("Unsupported string encoding.");
    }
}

function rotl(x, n) {
    return (x << n) | (x >>> (32 - n));
}
/** Byte length of a SHA1 digest. */
const BYTES = 20;
/**  A class representation of the SHA1 algorithm. */
class SHA1 {
    /** Creates a SHA1 instance. */
    constructor() {
        Object.defineProperty(this, "hashSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: BYTES
        });
        Object.defineProperty(this, "_buf", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Uint8Array(64)
        });
        Object.defineProperty(this, "_bufIdx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_count", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_K", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Uint32Array([0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6])
        });
        Object.defineProperty(this, "_H", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_finalized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.init();
    }
    /** Reduces the four input numbers to a single one. */
    static F(t, b, c, d) {
        if (t <= 19) {
            return (b & c) | (~b & d);
        }
        else if (t <= 39) {
            return b ^ c ^ d;
        }
        else if (t <= 59) {
            return (b & c) | (b & d) | (c & d);
        }
        else {
            return b ^ c ^ d;
        }
    }
    /** Initializes a hash instance. */
    init() {
        // prettier-ignore
        this._H = new Uint32Array([
            0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0
        ]);
        this._bufIdx = 0;
        this._count = new Uint32Array(2);
        this._buf.fill(0);
        this._finalized = false;
        return this;
    }
    /** Updates a hash with additional message data. */
    update(msg, inputEncoding) {
        if (msg === null) {
            throw new TypeError("msg must be a string or Uint8Array.");
        }
        else if (typeof msg === "string") {
            msg = encode(msg, inputEncoding);
        }
        // process the msg as many times as possible, the rest is stored in the buffer
        // message is processed in 512 bit (64 byte chunks)
        for (let i = 0; i < msg.length; i++) {
            this._buf[this._bufIdx++] = msg[i];
            if (this._bufIdx === 64) {
                this.transform();
                this._bufIdx = 0;
            }
        }
        // counter update (number of message bits)
        const c = this._count;
        if ((c[0] += msg.length << 3) < msg.length << 3) {
            c[1]++;
        }
        c[1] += msg.length >>> 29;
        return this;
    }
    /** Finalizes a hash with additional message data. */
    digest(outputEncoding) {
        if (this._finalized) {
            throw new Error("digest has already been called.");
        }
        this._finalized = true;
        // append '1'
        const b = this._buf;
        let idx = this._bufIdx;
        b[idx++] = 0x80;
        // zeropad up to byte pos 56
        while (idx !== 56) {
            if (idx === 64) {
                this.transform();
                idx = 0;
            }
            b[idx++] = 0;
        }
        // append length in bits
        const c = this._count;
        b[56] = (c[1] >>> 24) & 0xff;
        b[57] = (c[1] >>> 16) & 0xff;
        b[58] = (c[1] >>> 8) & 0xff;
        b[59] = (c[1] >>> 0) & 0xff;
        b[60] = (c[0] >>> 24) & 0xff;
        b[61] = (c[0] >>> 16) & 0xff;
        b[62] = (c[0] >>> 8) & 0xff;
        b[63] = (c[0] >>> 0) & 0xff;
        this.transform();
        // return the hash as byte array (20 bytes)
        const hash = new Uint8Array(BYTES);
        for (let i = 0; i < 5; i++) {
            hash[(i << 2) + 0] = (this._H[i] >>> 24) & 0xff;
            hash[(i << 2) + 1] = (this._H[i] >>> 16) & 0xff;
            hash[(i << 2) + 2] = (this._H[i] >>> 8) & 0xff;
            hash[(i << 2) + 3] = (this._H[i] >>> 0) & 0xff;
        }
        // clear internal states and prepare for new hash
        this.init();
        return outputEncoding ? decode$1(hash, outputEncoding) : hash;
    }
    /** Performs one transformation cycle. */
    transform() {
        const h = this._H;
        let a = h[0];
        let b = h[1];
        let c = h[2];
        let d = h[3];
        let e = h[4];
        // convert byte buffer to words
        const w = new Uint32Array(80);
        for (let i = 0; i < 16; i++) {
            w[i] =
                this._buf[(i << 2) + 3] |
                    (this._buf[(i << 2) + 2] << 8) |
                    (this._buf[(i << 2) + 1] << 16) |
                    (this._buf[i << 2] << 24);
        }
        for (let t = 0; t < 80; t++) {
            if (t >= 16) {
                w[t] = rotl(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
            }
            const tmp = (rotl(a, 5) +
                SHA1.F(t, b, c, d) +
                e +
                w[t] +
                this._K[Math.floor(t / 20)]) |
                0;
            e = d;
            d = c;
            c = rotl(b, 30);
            b = a;
            a = tmp;
        }
        h[0] = (h[0] + a) | 0;
        h[1] = (h[1] + b) | 0;
        h[2] = (h[2] + c) | 0;
        h[3] = (h[3] + d) | 0;
        h[4] = (h[4] + e) | 0;
    }
}
/** Generates a SHA1 hash of the input data. */
function sha1(msg, inputEncoding, outputEncoding) {
    return new SHA1().update(msg, inputEncoding).digest(outputEncoding);
}

/**
 * Creates a new script.
 *
 * Scripts offer the ability to optimistically try to execute a script without having to send the
 * entire script to the server. If the script is loaded on the server, it tries again by sending
 * the entire script. Afterwards, the script is cached on the server.
 *
 * @example
 * ```ts
 * const redis = new Redis({...})
 *
 * const script = redis.createScript<string>("return ARGV[1];")
 * const arg1 = await script.eval([], ["Hello World"])
 * assertEquals(arg1, "Hello World")
 * ```
 */
class Script {
    constructor(redis, script) {
        Object.defineProperty(this, "script", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sha1", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "redis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.redis = redis;
        this.sha1 = this.digest(script);
        this.script = script;
    }
    /**
     * Send an `EVAL` command to redis.
     */
    async eval(keys, args) {
        return await this.redis.eval(this.script, keys, args);
    }
    /**
     * Calculates the sha1 hash of the script and then calls `EVALSHA`.
     */
    async evalsha(keys, args) {
        return await this.redis.evalsha(this.sha1, keys, args);
    }
    /**
     * Optimistically try to run `EVALSHA` first.
     * If the script is not loaded in redis, it will fall back and try again with `EVAL`.
     *
     * Following calls will be able to use the cached script
     */
    async exec(keys, args) {
        const res = await this.redis.evalsha(this.sha1, keys, args).catch(async (err) => {
            if (err instanceof Error &&
                err.message.toLowerCase().includes("noscript")) {
                return await this.redis.eval(this.script, keys, args);
            }
            throw err;
        });
        return res;
    }
    /**
     * Compute the sha1 hash of the script and return its hex representation.
     */
    digest(s) {
        const hash = sha1(s, "utf8", "hex");
        return typeof hash === "string" ? hash : new TextDecoder().decode(hash);
    }
}

/**
 * Serverless redis client for upstash.
 */
let Redis$1 = class Redis {
    /**
     * Create a new redis client
     *
     * @example
     * ```typescript
     * const redis = new Redis({
     *  url: "<UPSTASH_REDIS_REST_URL>",
     *  token: "<UPSTASH_REDIS_REST_TOKEN>",
     * });
     * ```
     */
    constructor(client, opts) {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "opts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "enableTelemetry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Wrap a new middleware around the HTTP client.
         */
        Object.defineProperty(this, "use", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (middleware) => {
                const makeRequest = this.client.request.bind(this.client);
                this.client.request = (req) => middleware(req, makeRequest);
            }
        });
        /**
         * Technically this is not private, we can hide it from intellisense by doing this
         */
        Object.defineProperty(this, "addTelemetry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (telemetry) => {
                if (!this.enableTelemetry) {
                    return;
                }
                try {
                    // @ts-ignore - The `Requester` interface does not know about this method but it will be there
                    // as long as the user uses the standard HttpClient
                    this.client.mergeTelemetry(telemetry);
                }
                catch {
                    // ignore
                }
            }
        });
        /**
         * Create a new pipeline that allows you to send requests in bulk.
         *
         * @see {@link Pipeline}
         */
        Object.defineProperty(this, "pipeline", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => new Pipeline({
                client: this.client,
                commandOptions: this.opts,
                multiExec: false,
            })
        });
        /**
         * Create a new transaction to allow executing multiple steps atomically.
         *
         * All the commands in a transaction are serialized and executed sequentially. A request sent by
         * another client will never be served in the middle of the execution of a Redis Transaction. This
         * guarantees that the commands are executed as a single isolated operation.
         *
         * @see {@link Pipeline}
         */
        Object.defineProperty(this, "multi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => new Pipeline({
                client: this.client,
                commandOptions: this.opts,
                multiExec: true,
            })
        });
        /**
         * @see https://redis.io/commands/append
         */
        Object.defineProperty(this, "append", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new AppendCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/bitcount
         */
        Object.defineProperty(this, "bitcount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new BitCountCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/bitop
         */
        Object.defineProperty(this, "bitop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (op, destinationKey, sourceKey, ...sourceKeys) => new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/bitpos
         */
        Object.defineProperty(this, "bitpos", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new BitPosCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/dbsize
         */
        Object.defineProperty(this, "dbsize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => new DBSizeCommand(this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/decr
         */
        Object.defineProperty(this, "decr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new DecrCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/decrby
         */
        Object.defineProperty(this, "decrby", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new DecrByCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/del
         */
        Object.defineProperty(this, "del", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new DelCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/echo
         */
        Object.defineProperty(this, "echo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new EchoCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/eval
         */
        Object.defineProperty(this, "eval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new EvalCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/evalsha
         */
        Object.defineProperty(this, "evalsha", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new EvalshaCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/exists
         */
        Object.defineProperty(this, "exists", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ExistsCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/expire
         */
        Object.defineProperty(this, "expire", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ExpireCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/expireat
         */
        Object.defineProperty(this, "expireat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ExpireAtCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/flushall
         */
        Object.defineProperty(this, "flushall", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (args) => new FlushAllCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/flushdb
         */
        Object.defineProperty(this, "flushdb", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new FlushDBCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/get
         */
        Object.defineProperty(this, "get", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new GetCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/getbit
         */
        Object.defineProperty(this, "getbit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new GetBitCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/getdel
         */
        Object.defineProperty(this, "getdel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new GetDelCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/getrange
         */
        Object.defineProperty(this, "getrange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new GetRangeCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/getset
         */
        Object.defineProperty(this, "getset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, value) => new GetSetCommand([key, value], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hdel
         */
        Object.defineProperty(this, "hdel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HDelCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hexists
         */
        Object.defineProperty(this, "hexists", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HExistsCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hget
         */
        Object.defineProperty(this, "hget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HGetCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hgetall
         */
        Object.defineProperty(this, "hgetall", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HGetAllCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hincrby
         */
        Object.defineProperty(this, "hincrby", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HIncrByCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hincrbyfloat
         */
        Object.defineProperty(this, "hincrbyfloat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HIncrByFloatCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hkeys
         */
        Object.defineProperty(this, "hkeys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HKeysCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hlen
         */
        Object.defineProperty(this, "hlen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HLenCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hmget
         */
        Object.defineProperty(this, "hmget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HMGetCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hmset
         */
        Object.defineProperty(this, "hmset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, kv) => new HMSetCommand([key, kv], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hrandfield
         */
        Object.defineProperty(this, "hrandfield", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, count, withValues) => new HRandFieldCommand([key, count, withValues], this.opts)
                .exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hscan
         */
        Object.defineProperty(this, "hscan", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HScanCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hset
         */
        Object.defineProperty(this, "hset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, kv) => new HSetCommand([key, kv], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hsetnx
         */
        Object.defineProperty(this, "hsetnx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, field, value) => new HSetNXCommand([key, field, value], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hstrlen
         */
        Object.defineProperty(this, "hstrlen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HStrLenCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/hvals
         */
        Object.defineProperty(this, "hvals", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new HValsCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/incr
         */
        Object.defineProperty(this, "incr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new IncrCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/incrby
         */
        Object.defineProperty(this, "incrby", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new IncrByCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/incrbyfloat
         */
        Object.defineProperty(this, "incrbyfloat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new IncrByFloatCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/keys
         */
        Object.defineProperty(this, "keys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new KeysCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/lindex
         */
        Object.defineProperty(this, "lindex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new LIndexCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/linsert
         */
        Object.defineProperty(this, "linsert", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, direction, pivot, value) => new LInsertCommand([key, direction, pivot, value], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/llen
         */
        Object.defineProperty(this, "llen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new LLenCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/lmove
         */
        Object.defineProperty(this, "lmove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new LMoveCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/lpop
         */
        Object.defineProperty(this, "lpop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new LPopCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/lpos
         */
        Object.defineProperty(this, "lpos", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new LPosCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/lpush
         */
        Object.defineProperty(this, "lpush", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...elements) => new LPushCommand([key, ...elements], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/lpushx
         */
        Object.defineProperty(this, "lpushx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...elements) => new LPushXCommand([key, ...elements], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/lrange
         */
        Object.defineProperty(this, "lrange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new LRangeCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/lrem
         */
        Object.defineProperty(this, "lrem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, count, value) => new LRemCommand([key, count, value], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/lset
         */
        Object.defineProperty(this, "lset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, index, value) => new LSetCommand([key, index, value], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/ltrim
         */
        Object.defineProperty(this, "ltrim", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new LTrimCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/mget
         */
        Object.defineProperty(this, "mget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new MGetCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/mset
         */
        Object.defineProperty(this, "mset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (kv) => new MSetCommand([kv], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/msetnx
         */
        Object.defineProperty(this, "msetnx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (kv) => new MSetNXCommand([kv], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/persist
         */
        Object.defineProperty(this, "persist", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new PersistCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/pexpire
         */
        Object.defineProperty(this, "pexpire", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new PExpireCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/pexpireat
         */
        Object.defineProperty(this, "pexpireat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new PExpireAtCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/ping
         */
        Object.defineProperty(this, "ping", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (args) => new PingCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/psetex
         */
        Object.defineProperty(this, "psetex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ttl, value) => new PSetEXCommand([key, ttl, value], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/pttl
         */
        Object.defineProperty(this, "pttl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new PTtlCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/publish
         */
        Object.defineProperty(this, "publish", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new PublishCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/randomkey
         */
        Object.defineProperty(this, "randomkey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => new RandomKeyCommand().exec(this.client)
        });
        /**
         * @see https://redis.io/commands/rename
         */
        Object.defineProperty(this, "rename", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new RenameCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/renamenx
         */
        Object.defineProperty(this, "renamenx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new RenameNXCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/rpop
         */
        Object.defineProperty(this, "rpop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new RPopCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/rpush
         */
        Object.defineProperty(this, "rpush", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...elements) => new RPushCommand([key, ...elements], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/rpushx
         */
        Object.defineProperty(this, "rpushx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...elements) => new RPushXCommand([key, ...elements], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/sadd
         */
        Object.defineProperty(this, "sadd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...members) => new SAddCommand([key, ...members], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/scan
         */
        Object.defineProperty(this, "scan", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ScanCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/scard
         */
        Object.defineProperty(this, "scard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SCardCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/script-exists
         */
        Object.defineProperty(this, "scriptExists", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ScriptExistsCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/script-flush
         */
        Object.defineProperty(this, "scriptFlush", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ScriptFlushCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/script-load
         */
        Object.defineProperty(this, "scriptLoad", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ScriptLoadCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/sdiff
         */
        Object.defineProperty(this, "sdiff", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SDiffCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/sdiffstore
         */
        Object.defineProperty(this, "sdiffstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SDiffStoreCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/set
         */
        Object.defineProperty(this, "set", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, value, opts) => new SetCommand([key, value, opts], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/setbit
         */
        Object.defineProperty(this, "setbit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SetBitCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/setex
         */
        Object.defineProperty(this, "setex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ttl, value) => new SetExCommand([key, ttl, value], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/setnx
         */
        Object.defineProperty(this, "setnx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, value) => new SetNxCommand([key, value], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/setrange
         */
        Object.defineProperty(this, "setrange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SetRangeCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/sinter
         */
        Object.defineProperty(this, "sinter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SInterCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/sinterstore
         */
        Object.defineProperty(this, "sinterstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SInterStoreCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/sismember
         */
        Object.defineProperty(this, "sismember", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, member) => new SIsMemberCommand([key, member], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/smismember
         */
        Object.defineProperty(this, "smismember", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, members) => new SMIsMemberCommand([key, members], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/smembers
         */
        Object.defineProperty(this, "smembers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SMembersCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/smove
         */
        Object.defineProperty(this, "smove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (source, destination, member) => new SMoveCommand([source, destination, member], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/spop
         */
        Object.defineProperty(this, "spop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SPopCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/srandmember
         */
        Object.defineProperty(this, "srandmember", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SRandMemberCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/srem
         */
        Object.defineProperty(this, "srem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...members) => new SRemCommand([key, ...members], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/sscan
         */
        Object.defineProperty(this, "sscan", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SScanCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/strlen
         */
        Object.defineProperty(this, "strlen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new StrLenCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/sunion
         */
        Object.defineProperty(this, "sunion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SUnionCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/sunionstore
         */
        Object.defineProperty(this, "sunionstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new SUnionStoreCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/time
         */
        Object.defineProperty(this, "time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => new TimeCommand().exec(this.client)
        });
        /**
         * @see https://redis.io/commands/touch
         */
        Object.defineProperty(this, "touch", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new TouchCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/ttl
         */
        Object.defineProperty(this, "ttl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new TtlCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/type
         */
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new TypeCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/unlink
         */
        Object.defineProperty(this, "unlink", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new UnlinkCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zadd
         */
        Object.defineProperty(this, "zadd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => {
                if ("score" in args[1]) {
                    return new ZAddCommand([args[0], args[1], ...args.slice(2)], this.opts).exec(this.client);
                }
                return new ZAddCommand([args[0], args[1], ...args.slice(2)], this.opts).exec(this.client);
            }
        });
        /**
         * @see https://redis.io/commands/zcard
         */
        Object.defineProperty(this, "zcard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZCardCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zcount
         */
        Object.defineProperty(this, "zcount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZCountCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zdiffstore
         */
        Object.defineProperty(this, "zdiffstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZDiffStoreCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zincrby
         */
        Object.defineProperty(this, "zincrby", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, increment, member) => new ZIncrByCommand([key, increment, member], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zinterstore
         */
        Object.defineProperty(this, "zinterstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZInterStoreCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zlexcount
         */
        Object.defineProperty(this, "zlexcount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZLexCountCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zmscore
         */
        Object.defineProperty(this, "zmscore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZMScoreCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zpopmax
         */
        Object.defineProperty(this, "zpopmax", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZPopMaxCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zpopmin
         */
        Object.defineProperty(this, "zpopmin", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZPopMinCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zrange
         */
        Object.defineProperty(this, "zrange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZRangeCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zrank
         */
        Object.defineProperty(this, "zrank", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, member) => new ZRankCommand([key, member], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zrem
         */
        Object.defineProperty(this, "zrem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, ...members) => new ZRemCommand([key, ...members], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zremrangebylex
         */
        Object.defineProperty(this, "zremrangebylex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZRemRangeByLexCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zremrangebyrank
         */
        Object.defineProperty(this, "zremrangebyrank", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZRemRangeByRankCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zremrangebyscore
         */
        Object.defineProperty(this, "zremrangebyscore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZRemRangeByScoreCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zrevrank
         */
        Object.defineProperty(this, "zrevrank", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, member) => new ZRevRankCommand([key, member], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zscan
         */
        Object.defineProperty(this, "zscan", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZScanCommand(args, this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zscore
         */
        Object.defineProperty(this, "zscore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (key, member) => new ZScoreCommand([key, member], this.opts).exec(this.client)
        });
        /**
         * @see https://redis.io/commands/zunionstore
         */
        Object.defineProperty(this, "zunionstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (...args) => new ZUnionStoreCommand(args, this.opts).exec(this.client)
        });
        this.client = client;
        this.opts = opts;
        this.enableTelemetry = opts?.enableTelemetry ?? true;
    }
    get json() {
        return {
            /**
             * @see https://redis.io/commands/json.arrappend
             */
            arrappend: (...args) => new JsonArrAppendCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.arrindex
             */
            arrindex: (...args) => new JsonArrIndexCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.arrinsert
             */
            arrinsert: (...args) => new JsonArrInsertCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.arrlen
             */
            arrlen: (...args) => new JsonArrLenCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.arrpop
             */
            arrpop: (...args) => new JsonArrPopCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.arrtrim
             */
            arrtrim: (...args) => new JsonArrTrimCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.clear
             */
            clear: (...args) => new JsonClearCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.del
             */
            del: (...args) => new JsonDelCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.forget
             */
            forget: (...args) => new JsonForgetCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.get
             */
            get: (...args) => new JsonGetCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.mget
             */
            mget: (...args) => new JsonMGetCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.numincrby
             */
            numincrby: (...args) => new JsonNumIncrByCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.nummultby
             */
            nummultby: (...args) => new JsonNumMultByCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.objkeys
             */
            objkeys: (...args) => new JsonObjKeysCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.objlen
             */
            objlen: (...args) => new JsonObjLenCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.resp
             */
            resp: (...args) => new JsonRespCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.set
             */
            set: (...args) => new JsonSetCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.strappend
             */
            strappend: (...args) => new JsonStrAppendCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.strlen
             */
            strlen: (...args) => new JsonStrLenCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.toggle
             */
            toggle: (...args) => new JsonToggleCommand(args, this.opts).exec(this.client),
            /**
             * @see https://redis.io/commands/json.type
             */
            type: (...args) => new JsonTypeCommand(args, this.opts).exec(this.client),
        };
    }
    createScript(script) {
        return new Script(this, script);
    }
};

class HttpClient {
    constructor(config) {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "headers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "retry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.options = {
            backend: config.options?.backend,
            agent: config.agent,
            responseEncoding: config.responseEncoding ?? "base64",
            cache: config.cache,
        };
        this.baseUrl = config.baseUrl.replace(/\/$/, "");
        this.headers = {
            "Content-Type": "application/json",
            ...config.headers,
        };
        if (this.options.responseEncoding === "base64") {
            this.headers["Upstash-Encoding"] = "base64";
        }
        if (typeof config?.retry === "boolean" && config?.retry === false) {
            this.retry = {
                attempts: 1,
                backoff: () => 0,
            };
        }
        else {
            this.retry = {
                attempts: config?.retry?.retries ?? 5,
                backoff: config?.retry?.backoff ??
                    ((retryCount) => Math.exp(retryCount) * 50),
            };
        }
    }
    mergeTelemetry(telemetry) {
        function merge(obj, key, value) {
            if (!value) {
                return obj;
            }
            if (obj[key]) {
                obj[key] = [obj[key], value].join(",");
            }
            else {
                obj[key] = value;
            }
            return obj;
        }
        this.headers = merge(this.headers, "Upstash-Telemetry-Runtime", telemetry.runtime);
        this.headers = merge(this.headers, "Upstash-Telemetry-Platform", telemetry.platform);
        this.headers = merge(this.headers, "Upstash-Telemetry-Sdk", telemetry.sdk);
    }
    async request(req) {
        const requestOptions = {
            cache: this.options.cache,
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(req.body),
            keepalive: true,
            agent: this.options?.agent,
            /**
             * Fastly specific
             */
            backend: this.options?.backend,
        };
        let res = null;
        let error = null;
        for (let i = 0; i <= this.retry.attempts; i++) {
            try {
                res = await fetch([this.baseUrl, ...(req.path ?? [])].join("/"), requestOptions);
                break;
            }
            catch (err) {
                error = err;
                await new Promise((r) => setTimeout(r, this.retry.backoff(i)));
            }
        }
        if (!res) {
            throw error ?? new Error("Exhausted all retries");
        }
        const body = (await res.json());
        if (!res.ok) {
            throw new UpstashError(body.error);
        }
        if (this.options?.responseEncoding === "base64") {
            return Array.isArray(body) ? body.map(decode) : decode(body);
        }
        return body;
    }
}
function base64decode(b64) {
    let dec = "";
    try {
        /**
         * Using only atob() is not enough because it doesn't work with unicode characters
         */
        const binString = atob(b64);
        const size = binString.length;
        const bytes = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            bytes[i] = binString.charCodeAt(i);
        }
        dec = new TextDecoder().decode(bytes);
    }
    catch {
        dec = b64;
    }
    return dec;
    // try {
    //   return decodeURIComponent(dec);
    // } catch {
    //   return dec;
    // }
}
function decode(raw) {
    let result = undefined;
    switch (typeof raw.result) {
        case "undefined":
            return raw;
        case "number": {
            result = raw.result;
            break;
        }
        case "object": {
            if (Array.isArray(raw.result)) {
                result = raw.result.map((v) => typeof v === "string"
                    ? base64decode(v)
                    : Array.isArray(v)
                        ? v.map(base64decode)
                        : v);
            }
            else {
                // If it's not an array it must be null
                // Apparently null is an object in javascript
                result = null;
            }
            break;
        }
        case "string": {
            result = raw.result === "OK" ? "OK" : base64decode(raw.result);
            break;
        }
    }
    return { result, error: raw.error };
}

const VERSION = "v1.22.0";

// deno-lint-ignore-file
/**
 * Workaround for nodejs 14, where atob is not included in the standardlib
 */
if (typeof atob === "undefined") {
    global.atob = function (b64) {
        return Buffer.from(b64, "base64").toString("utf-8");
    };
}
/**
 * Serverless redis client for upstash.
 */
class Redis extends Redis$1 {
    constructor(configOrRequester) {
        if ("request" in configOrRequester) {
            super(configOrRequester);
            return;
        }
        if (configOrRequester.url.startsWith(" ") ||
            configOrRequester.url.endsWith(" ") ||
            /\r|\n/.test(configOrRequester.url)) {
            console.warn("The redis url contains whitespace or newline, which can cause errors!");
        }
        if (configOrRequester.token.startsWith(" ") ||
            configOrRequester.token.endsWith(" ") ||
            /\r|\n/.test(configOrRequester.token)) {
            console.warn("The redis token contains whitespace or newline, which can cause errors!");
        }
        const client = new HttpClient({
            baseUrl: configOrRequester.url,
            retry: configOrRequester.retry,
            headers: { authorization: `Bearer ${configOrRequester.token}` },
            agent: configOrRequester.agent,
            responseEncoding: configOrRequester.responseEncoding,
            cache: configOrRequester.cache || "no-store",
        });
        super(client, {
            automaticDeserialization: configOrRequester.automaticDeserialization,
            enableTelemetry: !process.env.UPSTASH_DISABLE_TELEMETRY,
        });
        this.addTelemetry({
            runtime: typeof EdgeRuntime === "string"
                ? "edge-light"
                : `node@${process.version}`,
            platform: process.env.VERCEL
                ? "vercel"
                : process.env.AWS_REGION
                    ? "aws"
                    : "unknown",
            sdk: `@upstash/redis@${VERSION}`,
        });
    }
    /**
     * Create a new Upstash Redis instance from environment variables.
     *
     * Use this to automatically load connection secrets from your environment
     * variables. For instance when using the Vercel integration.
     *
     * This tries to load `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from
     * your environment using `process.env`.
     */
    static fromEnv(config) {
        // @ts-ignore process will be defined in node
        if (typeof process?.env === "undefined") {
            throw new Error('Unable to get environment variables, `process.env` is undefined. If you are deploying to cloudflare, please import from "@upstash/redis/cloudflare" instead');
        }
        // @ts-ignore process will be defined in node
        const url = process?.env["UPSTASH_REDIS_REST_URL"];
        if (!url) {
            throw new Error("Unable to find environment variable: `UPSTASH_REDIS_REST_URL`");
        }
        // @ts-ignore process will be defined in node
        const token = process?.env["UPSTASH_REDIS_REST_TOKEN"];
        if (!token) {
            throw new Error("Unable to find environment variable: `UPSTASH_REDIS_REST_TOKEN`");
        }
        return new Redis({ ...config, url, token });
    }
}

process.env.NODE_ENV === "development" ? 60 * 3 : 60 * 30;
let redis = void 0;
function initRedis(url_, token_) {
  const url = url_ || getEnvVar(EnvVar.REDIS_UPSTASH_URL);
  const token = token_ || getEnvVar(EnvVar.REDIS_TOKEN);
  if (!redis) {
    if (!url) {
      throw new Error("initRedis: url is not defined");
    }
    if (!token) {
      throw new Error("initRedis: token is not defined");
    }
    redis = new Redis({
      url,
      token
    });
  }
  return redis;
}
const getRedisClient = () => {
  if (!redis)
    throw new Error("Calling getRedisClient before calling initRedis");
  return redis;
};
async function storeRedis(key, val) {
  try {
    const redisClient = getRedisClient();
    const options = {};
    const res = await redisClient.set(key, JSON.stringify(val), options);
    if (res !== "OK") {
      console.error("Can't store JSON into Redis, error:" + res);
      return false;
    } else {
      console.debug(`⚪ [${key}] Redis cache updated`);
    }
    return true;
  } catch (error) {
    console.log(`🟠 [${key}] Warning: Redis cache update failed with: ${error.message}`);
    return false;
  }
}
async function fetchJson(key) {
  let maybeStr;
  const redisClient = getRedisClient();
  try {
    maybeStr = await redisClient.get(key);
    if (!maybeStr)
      return null;
    const json = typeof maybeStr === "object" ? maybeStr : JSON.parse(maybeStr);
    return json;
  } catch (error) {
    console.error(`// error while getting redis key ${key}`);
    throw error;
  }
}

const logToFile = async (fileName, object, options = {}) => {
  if (!process.env.NEXT_RUNTIME || process.env.NEXT_RUNTIME === "nodejs") {
    const helpers = await import('../log_to_file_B_Erzw8W.mjs');
    return helpers.logToFile(fileName, object, options);
  } else {
    return;
  }
};

var CacheType = /* @__PURE__ */ ((CacheType2) => {
  CacheType2["REDIS"] = "redis";
  CacheType2["MONGODB"] = "mongodb";
  return CacheType2;
})(CacheType || {});
var SourceType = /* @__PURE__ */ ((SourceType2) => {
  SourceType2["REDIS"] = "redis";
  SourceType2["MONGODB"] = "MONGODB";
  SourceType2["MEMORY"] = "memory";
  SourceType2["API"] = "api";
  return SourceType2;
})(SourceType || {});

async function runFetchPipeline(steps) {
  const previousSteps = [];
  if (!steps.length) {
    console.warn("Empty fetch pipeline, will not return any data");
  }
  if (!!steps[steps.length - 1].set) {
    console.warn("Last method of a data fetching pipeline shouldn't have a 'set' method, it is a the source of truth and not a cache");
  }
  if (steps[steps.length - 1].disabled) {
    console.warn("Last method of a data fetching pipeline not be disabled, it is the source of truth");
  }
  for (const step of steps) {
    if (step.disabled) {
      console.log(`Skipping disabled step "${step.name}"`);
      continue;
    }
    previousSteps.push(step);
    if (!step.get) {
      continue;
    }
    if (step.optimizedHas) {
      const hasCachedData = await step.optimizedHas();
      if (!hasCachedData)
        continue;
    }
    const data = await step.get();
    const nonNullData = data !== null && typeof data !== "undefined";
    if (nonNullData) {
      console.debug(`🟢 [${step.name}] data hit`);
      await Promise.all(
        previousSteps.filter((step2) => !!step2.set).map(async (previousStep) => {
          await previousStep.set(data);
        })
      );
      return data;
    }
  }
  return null;
}
function pipeline() {
  const p = [];
  return {
    p,
    step: function(s) {
      this.p.push(s);
      return this;
    },
    steps: function(...s) {
      console.log("this", this);
      this.p.push(...s);
      return this;
    },
    run: function() {
      return runFetchPipeline(p);
    }
  };
}

const memoryCache = new NodeCache({
  // This TTL must stay short, because we manually invalidate this cache
  stdTTL: 5 * 60,
  // in seconds
  // needed for caching promises
  useClones: false
});
const isNodeRuntime = !process.env.NEXT_RUNTIME || process.env.NEXT_RUNTIME === "nodejs";
function removeNull$1(obj) {
  let clean = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === Object(v) ? removeNull$1(v) : v]).filter(([_, v]) => v != null)
    // we keep empty objects around
    // otherwise "data" type  (empty objects are objects)
    // or boolean casts (empty objects are truthy)
    // might become inconsistent
  );
  return Array.isArray(obj) ? Object.values(clean) : clean;
}
const cacheFunctions = {
  [CacheType.REDIS]: {
    fetch: fetchJson,
    store: storeRedis
  }
};
function processFetchData(data, source, key) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const ___metadata = { key, source, timestamp };
  const result = { data, ___metadata, cacheKey: key };
  return removeNull$1(result);
}
const setResultSource = (result, source) => {
  return {
    ...result,
    ___metadata: { ...result.___metadata, source }
  };
};
async function getFromCacheOrSource({
  key,
  fetchFromSource,
  calledFromLog,
  shouldUpdateCache = true,
  shouldCompress = false,
  cacheType = CacheType.REDIS
}) {
  const cachedData = await fetchPayload(key, { cacheType });
  if (cachedData) {
    console.debug(`🔵 [${key}] in-memory cache miss, remote cache hit ${calledFromLog}`);
    return cachedData;
  }
  console.debug(`🟣 [${key}] in-memory & remote cache miss, fetching from API ${calledFromLog}`);
  const result = await fetchFromSource();
  const processedResult = processFetchData(result, SourceType.API, key);
  if (shouldUpdateCache) {
    await storePayload(key, setResultSource(processedResult, SourceType.REDIS), {
      shouldCompress,
      cacheType
    });
  }
  return processedResult;
}
async function getFromCache({
  key,
  fetchFunction: fetchFromSource,
  calledFrom,
  redisUrl,
  redisToken,
  shouldGetFromCache: shouldGetFromCacheOptions,
  shouldUpdateCache = true,
  shouldThrow = true,
  shouldCompress = false,
  cacheType = CacheType.REDIS
}) {
  const startAt = /* @__PURE__ */ new Date();
  let inMemory = false;
  initRedis(redisUrl, redisToken);
  const calledFromLog = calledFrom ? `(↪️  ${calledFrom})` : "";
  const shouldGetFromCacheEnv = !(process.env.DISABLE_CACHE === "true");
  const shouldGetFromCache = shouldGetFromCacheOptions ?? shouldGetFromCacheEnv;
  async function fetchAndProcess(source) {
    const data = await fetchFromSource();
    return processFetchData(data, source, key);
  }
  let resultPromise;
  try {
    if (shouldGetFromCache && memoryCache.has(key)) {
      console.debug(`🟢 [${key}] in-memory cache hit ${calledFromLog}`);
      inMemory = true;
      resultPromise = memoryCache.get(key);
    } else {
      if (shouldGetFromCache) {
        resultPromise = getFromCacheOrSource({
          key,
          fetchFromSource,
          calledFromLog,
          shouldUpdateCache,
          shouldCompress
        });
      } else {
        console.debug(
          `🟡 [${key}] Redis cache disabled, fetching from source ${calledFromLog}`
        );
        resultPromise = fetchAndProcess(SourceType.API);
        if (shouldUpdateCache) {
          const result2 = await resultPromise;
          await storePayload(
            key,
            {
              ...result2,
              ___metadata: { ...result2.___metadata, source: SourceType.REDIS }
            },
            { shouldCompress, cacheType }
          );
        }
      }
      memoryCache.set(key, resultPromise);
    }
    let result = await resultPromise;
    if (inMemory) {
      result = setResultSource(result, SourceType.MEMORY);
    } else {
      await logToFile(`fetch/${key}.json`, result, {
        mode: "overwrite"
      });
    }
    const endAt = /* @__PURE__ */ new Date();
    result.duration = endAt.getTime() - startAt.getTime();
    return result;
  } catch (error) {
    console.error("// getFromCache error");
    console.error(error);
    console.debug(`🔴 [${key}] error when fetching from Redis or source ${calledFromLog}`);
    memoryCache.del(key);
    if (shouldThrow) {
      throw error;
    } else {
      const result = { error: error.message };
      return result;
    }
  }
}
const getApiUrl = () => {
  const apiUrl = getEnvVar(EnvVar.API_URL);
  if (!apiUrl) {
    throw new Error("process.env.API_URL not defined, it should point the the API");
  }
  return apiUrl;
};
function extractQueryName(queryString) {
  const regex = /query\s+(\w+)/;
  const match = regex.exec(queryString);
  return match ? match[1] : null;
}
async function graphqlFetcher(query, variables, fetchOptions, apiUrl_) {
  const apiUrl = apiUrl_ || getApiUrl();
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ query, variables: {} }),
    ...fetchOptions || {}
  });
  const json = await response.json();
  return json;
}
const fetchGraphQLApi = async ({
  query,
  key: key_,
  apiUrl: apiUrl_,
  cache
}) => {
  const apiUrl = apiUrl_ || getApiUrl();
  const key = key_ || extractQueryName(query);
  await logToFile(`graphql/${key}.gql`, query);
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ query, variables: {} }),
    cache: cache || void 0
  });
  const json = await response.json();
  if (json.errors) {
    console.error(`// fetchGraphQLApi error 1 for query ${key}.gql (${apiUrl})`);
    console.error(JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors[0].message);
  }
  return json.data || {};
};
async function storePayload(key, payload, options = {
  shouldCompress: false,
  cacheType: CacheType.REDIS
}) {
  const { shouldCompress, cacheType } = options;
  const storeFunction = cacheFunctions[cacheType]["store"];
  if (shouldCompress && isNodeRuntime) {
    const { compressJSON } = await import('../compress_C7YnNBjZ.mjs');
    const compressedData = await compressJSON(payload.data);
    const compressedPayload = {
      ...payload,
      ___metadata: { ...payload.___metadata, isCompressed: true },
      data: compressedData
    };
    return await storeFunction(key, compressedPayload);
  } else {
    return await storeFunction(key, payload);
  }
}
async function fetchPayload(key, options = { cacheType: CacheType.REDIS }) {
  const { cacheType } = options;
  const fetchFunction = cacheFunctions[cacheType]["fetch"];
  const payload = await fetchFunction(key);
  if (payload?.___metadata?.isCompressed && isNodeRuntime) {
    const { decompressJSON } = await import('../compress_C7YnNBjZ.mjs');
    const uncompressedData = await decompressJSON(payload.data);
    return {
      ...payload,
      data: uncompressedData
    };
  } else {
    return payload;
  }
}

const getAppName = (options) => options?.appName || process.env.APP_NAME;
const editionSitemapCacheKey = (options) => `${getAppName(options)}__${options.surveyId}__${options.editionId}__sitemap`;

const getEntityFragment = (options = {}) => {
  const { isFull = false } = options;
  return `
id
nameClean
nameHtml
example {
  label
  language
  code
  codeHighlighted
}
descriptionClean
descriptionHtml
homepage {
  url
}
github {
  url
}
mdn {
  url
  summary
}
w3c {
  url
}
caniuse {
  name
  url
}
resources {
  title
  url
}
twitterName
twitter {
  url
  name
}
${isFull ? `
tags
exactMatch
parentId
patterns` : ""}
`;
};

const getEditionSitemapQuery = ({ editionId }) => `
  query ${editionId}SitemapQuery {
    _metadata(editionId: ${editionId}) {
      surveys {
        editions {
          id
          surveyId
          year
          status
          resultsStatus
          hashtag
          startedAt
          endedAt
          questionsUrl
          issuesUrl
          discordUrl
          feedbackUrl
          resultsUrl
          imageUrl
          faviconUrl
          socialImageUrl
          faq
          enableReadingList
          enableChartSponsorships
          colors {
            primary
            secondary
            text
            background
            backgroundSecondary
          }
          survey {
            domain
            id
            name
            responsesCollectionName
            normalizedCollectionName
            hashtag
            emailOctopus {
              listId
            }
            partners {
              id
              name
              url
              imageUrl
            }
          }
          sponsors {
            id
            imageUrl
            name
            url
          }
          credits {
            id
            role
            entity {
              id
              name
              twitterName
              homepageUrl
              company {
                name
                homepage {
                  url
                }
              }
            }
          }
          
          sitemap {
            id
            path
            titleId
            descriptionId
            children {
              descriptionId
              id
              path
              titleId
              blocks {
                id
                entity {
                    ${getEntityFragment()}
                }
                fieldId
                tabId
                titleId
                descriptionId
                i18nNamespace
                template
                blockType
                filtersState
                year
                items
                defaultUnits
                parameters {
                  years
                  rankCutoff
                  limit
                  cutoff
                  showNoAnswer
                }
                queryOptions {
                  addBucketsEntities
                }
                variants {
                  id
                  entity {
                      ${getEntityFragment()}
                  }
                  fieldId
                  tabId
                  titleId
                  descriptionId
                  i18nNamespace
                  template
                  blockType
                  filtersState
                  year
                  items
                  defaultUnits
                  parameters {
                    years
                    rankCutoff
                    limit
                    cutoff
                    showNoAnswer
                  }
                  queryOptions {
                    addBucketsEntities
                  }
                }
              }
            }
            blocks {
              id
              entity {
                  ${getEntityFragment()}
              }
              fieldId
              tabId
              titleId
              descriptionId
              i18nNamespace
              template
              blockType
              filtersState
              year
              items
              defaultUnits
              parameters {
                years
                rankCutoff
                limit
                cutoff
                showNoAnswer
              }
              queryOptions {
                addBucketsEntities
              }
              variants {
                id
                entity {
                    ${getEntityFragment()}
                }
                fieldId
                tabId
                titleId
                descriptionId
                i18nNamespace
                template
                blockType
                filtersState
                year
                items
                defaultUnits
                parameters {
                  years
                  rankCutoff
                  limit
                  cutoff
                  showNoAnswer
                }
                queryOptions {
                  addBucketsEntities
                }
              }
            }
          }
        }
      }
    }
  }
  `;

async function fetchEditionSitemap(options) {
  const { appName, surveyId, editionId, calledFrom } = options;
  const getQuery = options.getQuery || getEditionSitemapQuery;
  const query = getQuery({ editionId });
  if (!surveyId) {
    throw new Error(`surveyId not defined (calledFrom: ${calledFrom})`);
  }
  if (!editionId) {
    throw new Error(`editionId not defined (calledFrom: ${calledFrom})`);
  }
  const key = editionSitemapCacheKey({
    appName,
    surveyId,
    editionId
  });
  return await getFromCache({
    key,
    fetchFunction: async () => {
      const result = await fetchGraphQLApi({
        query,
        key
      });
      if (!result) {
        throw new Error(
          `Couldn't fetch survey ${editionId}, result: ${result && JSON.stringify(result)}`
        );
      }
      return result._metadata.surveys[0].editions[0];
    },
    ...options
  });
}

const allowedCachingMethods = () => {
  let cacheLevel = { filesystem: true, api: true, redis: true };
  if (process.env.DISABLE_CACHE === "true") {
    cacheLevel = { filesystem: false, api: false, redis: false };
  } else {
    if (process.env.DISABLE_FILESYSTEM_CACHE === "true") {
      cacheLevel.filesystem = false;
    }
    if (process.env.DISABLE_API_CACHE === "true") {
      cacheLevel.api = false;
    }
    if (process.env.DISABLE_REDIS_CACHE === "true") {
      cacheLevel.redis = false;
    }
  }
  return cacheLevel;
};

let surveyWithSitemap = null;
async function astroSurveyWithRawSitemap() {
  if (surveyWithSitemap) {
    console.debug("Cache hit surveyWithSitemap");
    return surveyWithSitemap;
  }
  console.debug("Cache miss surveyWithSitemap");
  const editionId = getEnvVar(EnvVar.EDITIONID);
  const surveyId = getEnvVar(EnvVar.SURVEYID);
  const surveyWithSitemapRes = await fetchEditionSitemap({ editionId, surveyId });
  surveyWithSitemap = surveyWithSitemapRes.data;
  return surveyWithSitemap;
}

const defaultTheme = {
  typography: {
    fontFamily2: "Arial",
    size: {},
    weight: {
      bold: "400"
    }
  }
};
let theme = null;
function initTheme(themeConfig) {
  theme = themeConfig || defaultTheme;
  return theme;
}
function getTheme() {
  if (!theme) {
    throw new Error("Called getTheme before it was initialized");
  }
  return theme;
}

const secondaryFontMixin = () => `
    font-family: ${getTheme().typography.fontFamily2};
    letter-spacing: 2px;
    /* font-weight: ${getTheme().typography.weight.bold}; */
`;
const fontSize = (size) => {
  const themeSize = getTheme().typography.size[size];
  if (!themeSize) {
    console.warn("Theme has no typography size", themeSize);
    return "16px";
  }
  return themeSize;
};

const breakpoints = {
  xSmall: 600,
  small: 600,
  medium: 1e3,
  xLarge: 1200
};
const mq = {
  breakpoints,
  // smaller than x-small-break
  xSmall: `screen and (max-width: ${breakpoints.xSmall - 1}px)`,
  // smaller than small-break
  small: `screen and (max-width: ${breakpoints.small - 1}px)`,
  // smaller than medium-break
  smallMedium: `screen and (max-width: ${breakpoints.medium - 1}px)`,
  // between small and medium-break
  medium: `screen and (min-width: ${breakpoints.small}px) and (max-width: ${breakpoints.medium - 1}px)`,
  // larger than small-break
  mediumLarge: `screen and (min-width: ${breakpoints.small}px)`,
  // larger than medium-break
  large: `screen and (min-width: ${breakpoints.medium}px)`,
  // larger than large-break
  xLarge: `screen and (min-width: ${breakpoints.xLarge}px)`
};

z.array(z.object({}));
function processRawSitemap(rawSitemapYaml) {
  const rawSitemap = rawSitemapYaml;
  return rawSitemap;
}

const getPageLabelKey = (pageDefinition) => pageDefinition.titleId || `sections.${pageDefinition.intlId || pageDefinition.id}.title`;

const $$Astro$2 = createAstro();
const $$PageHeader = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$PageHeader;
  const { pageDefinition } = Astro2.locals;
  return renderTemplate`<style>${unescapeHTML(`
    h2 {
        ${secondaryFontMixin()}
    @media ${mq.small} {
        font-size: ${fontSize("larger")};
    }
    @media ${mq.mediumLarge} {
        font-size: ${fontSize("huge")};
    }
    `)}</style>${maybeRenderHead()}<h2 class="PageTitle">${getPageLabelKey(pageDefinition)}</h2>`;
}, "/home/eric-burel/code-ssd/devographics/monorepo/results-astro/src/components/pages/PageHeader.astro", void 0);

const $$Astro$1 = createAstro();
const $$PageTemplate = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$PageTemplate;
  const { showTitle } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<main> ${showTitle && renderTemplate`${renderComponent($$result, "PageHeader", $$PageHeader, {})}`} </main>`;
}, "/home/eric-burel/code-ssd/devographics/monorepo/results-astro/src/components/pages/PageTemplate.astro", void 0);

const convertToGraphQLEnum = (s) => s.replace("-", "_");
const getLocalesQuery = (contexts, loadStrings = true) => {
  const args = [];
  if (contexts.length > 0) {
    args.push(`contexts: [${contexts.join(", ")}]`);
  }
  const argumentsString = args.length > 0 ? `(${args.join(", ")})` : "";
  return `
query {
        locales${argumentsString} {
            completion
            id
            label
            ${loadStrings ? `strings {
                key
                t
                tHtml
                tClean
                context
                isFallback
            }` : ""}
            translators
        }
}
`;
};
const getLocaleContextQuery = (localeId, context) => {
  return `
query {
        locale(localeId: ${convertToGraphQLEnum(localeId)}, contexts: [${context}]) {
            id
            label
            strings {
                key
                t
                tHtml
                tClean
                context
                isFallback
            }
        }
}
`;
};

function removeNull(obj) {
  const clean = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === Object(v) ? removeNull(v) : v]).filter(([_, v]) => v != null && (v !== Object(v) || Object.keys(v).length))
  );
  return Array.isArray(obj) ? Object.values(clean) : clean;
}
const allLocalesCacheKey = () => `${process.env.APP_NAME}__allLocales__metadata`;
const getLocaleContextCacheKey = (localeId, context) => `${process.env.APP_NAME}__locale__${localeId}__${context}__parsed`;
const getLocalesGraphQL = async ({ contexts, key }) => {
  const localesQuery = getLocalesQuery(contexts, false);
  logToFile(`locales/${key}.graphql`, localesQuery);
  const fullResult = await graphqlFetcher(
    `
                ${localesQuery}
            `
  );
  if (!fullResult)
    throw new Error("Graphql fetcher function did not return an object");
  const localesResults = removeNull(fullResult);
  logToFile(`locales/${key}.json`, localesResults);
  console.log("fullResults", fullResult);
  const locales = localesResults.data.locales;
  return locales;
};
const getLocaleContextGraphQL = async ({ localeId, context, key }) => {
  const localesQuery = getLocaleContextQuery(localeId, context);
  logToFile(`locales/${key}.graphql`, localesQuery);
  const localesResults = removeNull(
    await graphqlFetcher(
      `
                ${localesQuery}
            `
    )
  );
  logToFile(`locales/${key}.json`, localesResults);
  const locale = localesResults.data.locale;
  return locale;
};
function redisFetchStep(cacheKey) {
  initRedis();
  return {
    get: async () => {
      return await fetchJson(cacheKey);
    },
    set: async (locales) => {
      await storeRedis(cacheKey, locales);
    },
    name: "redis"
  };
}
async function getAllLocaleDefinitions({ contexts }) {
  const allowedCaches = allowedCachingMethods();
  const allLocalesKey = allLocalesCacheKey();
  const localeDefinitions = await pipeline().steps(
    // log locales in file system for debugging
    {
      name: "logToFile",
      set: (locales) => {
        logToFile("localesMetadataRedis.json", locales);
      },
      disabled: !allowedCaches.filesystem
    },
    // get from Redis
    {
      ...redisFetchStep(allLocalesKey),
      disabled: !allowedCaches.redis
    },
    // GraphQL API = source of truth
    {
      get: async () => {
        return await getLocalesGraphQL({ contexts, key: allLocalesKey });
      }
    }
  ).run();
  if (!localeDefinitions)
    throw new Error("Couldn't get locales");
  return localeDefinitions;
}
async function getLocaleContextStrings({ locale, context }) {
  const allowedCaches = allowedCachingMethods();
  const contextKey = getLocaleContextCacheKey(locale.id, context);
  const localeContextStringsFetchSteps = [
    {
      ...redisFetchStep(contextKey),
      disabled: !allowedCaches.redis
    },
    {
      get: async () => {
        const data = await getLocaleContextGraphQL({
          localeId: locale.id,
          context,
          key: contextKey
        });
        return data?.strings;
      }
    }
  ];
  const strings = await runFetchPipeline(localeContextStringsFetchSteps);
  if (!strings)
    throw new Error(`Strings not found for locale ${locale.id}`);
  return strings;
}
const getLocalesWithStrings = async ({ localeIds, contexts }) => {
  let locales = await getAllLocaleDefinitions({ contexts });
  if (localeIds && localeIds.length > 0) {
    locales = locales.filter(({ id }) => localeIds.includes(id));
  }
  for (const locale of locales) {
    let localeStrings = [];
    for (const context of contexts) {
      const strings = await getLocaleContextStrings({ locale, context });
      localeStrings = [...localeStrings, ...strings];
    }
    locale.strings = localeStrings;
  }
  logToFile("localesResultsRedis.json", locales);
  return locales;
};

const $$Astro = createAstro();
const getStaticPaths = async () => {
  function removeSlash(str) {
    if (!str)
      return str;
    if (str[0] === "/")
      return str.slice(1);
    return str;
  }
  const surveyWithRawSitemap = await astroSurveyWithRawSitemap();
  const sitemap = processRawSitemap(surveyWithRawSitemap.sitemap);
  console.log(
    "Paths in sitemap:",
    sitemap.map((s) => s.path)
  );
  return sitemap.map((pageDefinition) => {
    console.log("PATH", removeSlash(pageDefinition.path));
    return {
      params: {
        path: pageDefinition.path === "/" ? void 0 : removeSlash(pageDefinition.path),
        // TODO: generate for each possible locale here
        // TODO: setup a home page that redirects to "en-US" or the user locale from the client
        // + an Edgle middleware that does that server-side when hosting on Vercel directly
        locale: "en-US"
      },
      props: {
        pageDefinition
      }
    };
  });
};
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { editionId, surveyId } = astroEnv();
  const survey = await astroSurveyWithRawSitemap();
  Astro2.locals.survey = survey;
  const sitemap = processRawSitemap(survey.sitemap);
  Astro2.locals.sitemap = sitemap;
  const theme = initTheme();
  Astro2.locals.theme = theme;
  const locales = await getLocalesWithStrings({
    localeIds: ["en-US"],
    // TODO load all ids
    // TODO: translationContexts are currently hard-coded in the results app code
    //  and not visible in the "surveys" repo, we need to move them there, or compute the context from the survey id
    contexts: ["results", surveyId, surveyId + "_" + survey.year]
  });
  console.log("locales:", locales);
  const { pageDefinition } = Astro2.props;
  Astro2.locals.pageDefinition = pageDefinition;
  const { path } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Welcome to Astro.", "data-astro-cid-ipjywe5y": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main data-astro-cid-ipjywe5y>  ${renderComponent($$result2, "PageTemplate", $$PageTemplate, { "showTitle": true, "data-astro-cid-ipjywe5y": true })} <svg class="astro-a" width="495" height="623" viewBox="0 0 495 623" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-astro-cid-ipjywe5y> <path fill-rule="evenodd" clip-rule="evenodd" d="M167.19 364.254C83.4786 364.254 0 404.819 0 404.819C0 404.819 141.781 19.4876 142.087 18.7291C146.434 7.33701 153.027 0 162.289 0H332.441C341.703 0 348.574 7.33701 352.643 18.7291C352.92 19.5022 494.716 404.819 494.716 404.819C494.716 404.819 426.67 364.254 327.525 364.254L264.41 169.408C262.047 159.985 255.147 153.581 247.358 153.581C239.569 153.581 232.669 159.985 230.306 169.408L167.19 364.254ZM160.869 530.172C160.877 530.18 160.885 530.187 160.894 530.195L160.867 530.181C160.868 530.178 160.868 530.175 160.869 530.172ZM136.218 411.348C124.476 450.467 132.698 504.458 160.869 530.172C160.997 529.696 161.125 529.242 161.248 528.804C161.502 527.907 161.737 527.073 161.917 526.233C165.446 509.895 178.754 499.52 195.577 500.01C211.969 500.487 220.67 508.765 223.202 527.254C224.141 534.12 224.23 541.131 224.319 548.105C224.328 548.834 224.337 549.563 224.347 550.291C224.563 566.098 228.657 580.707 237.264 593.914C245.413 606.426 256.108 615.943 270.749 622.478C270.593 621.952 270.463 621.508 270.35 621.126C270.045 620.086 269.872 619.499 269.685 618.911C258.909 585.935 266.668 563.266 295.344 543.933C298.254 541.971 301.187 540.041 304.12 538.112C310.591 533.854 317.059 529.599 323.279 525.007C345.88 508.329 360.09 486.327 363.431 457.844C364.805 446.148 363.781 434.657 359.848 423.275C358.176 424.287 356.587 425.295 355.042 426.275C351.744 428.366 348.647 430.33 345.382 431.934C303.466 452.507 259.152 455.053 214.03 448.245C184.802 443.834 156.584 436.019 136.218 411.348Z" fill="url(#paint0_linear_1805_24383)" data-astro-cid-ipjywe5y></path> <defs data-astro-cid-ipjywe5y> <linearGradient id="paint0_linear_1805_24383" x1="247.358" y1="0" x2="247.358" y2="622.479" gradientUnits="userSpaceOnUse" data-astro-cid-ipjywe5y> <stop stop-opacity="0.9" data-astro-cid-ipjywe5y></stop> <stop offset="1" stop-opacity="0.2" data-astro-cid-ipjywe5y></stop> </linearGradient> </defs> </svg> <h1 data-astro-cid-ipjywe5y>Welcome to <span class="text-gradient" data-astro-cid-ipjywe5y>Astro</span></h1> <p class="instructions" data-astro-cid-ipjywe5y>
You are reading the survey of surveyId "${surveyId}" and editionId "${editionId}", accessing the path "${path}"
</p> <div data-astro-cid-ipjywe5y> <p data-astro-cid-ipjywe5y>Raw Sitemap</p> <pre data-astro-cid-ipjywe5y><code data-astro-cid-ipjywe5y>
          ${JSON.stringify(survey.sitemap, null, 2)}
        </code></pre> </div> <div data-astro-cid-ipjywe5y> <p data-astro-cid-ipjywe5y>Sitemap</p> <pre data-astro-cid-ipjywe5y><code data-astro-cid-ipjywe5y>
          ${JSON.stringify(sitemap, null, 2)}
        </code></pre> </div> <ul role="list" class="link-card-grid" data-astro-cid-ipjywe5y> ${renderComponent($$result2, "Card", $$Card, { "href": "https://docs.astro.build/", "title": "Documentation", "body": "Learn how Astro works and explore the official API docs.", "data-astro-cid-ipjywe5y": true })} ${renderComponent($$result2, "Card", $$Card, { "href": "https://astro.build/integrations/", "title": "Integrations", "body": "Supercharge your project with new frameworks and libraries.", "data-astro-cid-ipjywe5y": true })} ${renderComponent($$result2, "Card", $$Card, { "href": "https://astro.build/themes/", "title": "Themes", "body": "Explore a galaxy of community-built starter themes.", "data-astro-cid-ipjywe5y": true })} ${renderComponent($$result2, "Card", $$Card, { "href": "https://astro.build/chat/", "title": "Community", "body": "Come say hi to our amazing Discord community. \u2764\uFE0F", "data-astro-cid-ipjywe5y": true })} </ul> </main> ` })} `;
}, "/home/eric-burel/code-ssd/devographics/monorepo/results-astro/src/pages/[locale]/[...path].astro", void 0);

const $$file = "/home/eric-burel/code-ssd/devographics/monorepo/results-astro/src/pages/[locale]/[...path].astro";
const $$url = "/[locale]/[...path]";

export { $$ as default, $$file as file, getStaticPaths, $$url as url };
