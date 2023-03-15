# Monorepo

## Initial setup and run

To run the "surveyform":
- `just dbs` will run Mongo and Redis (via Docker)
- `cd api-internal && pnpm run dev` will run the internal API that serves locales and entities
- `cd surveyform && pnpm run dev` will run the surveyform (surveyadmin works similarly)

Sections below explain how to properly setup relevant toolings and folders.

### Other git repositories to clone

APIs may depend on GitHub repository. 

To avoid calling the GitHub API systematically, you can download the repositories locally. This is relevant for `api-internal` for instance.

Expected folder structure:
```sh
devographics
|_ monorepo
|_ locales
# here load all locale repos: https://github.com/orgs/Devographics/repositories?language=&q=locale&sort=&type=all
|____locale-fr-FR
|____....
# here load surveys yaml: https://github.com/Devographics/surveys
|_surveys
```

The script "./scripts/listLocaleRepos.mjs" can help to get the list of commands to run.

## Shared packages

To use a shared package in your app:
- Add a workspace dependency: "@devographics/core-models":"workspace:*"
- When deploying, configure the host to load the whole monorepo (eg on Vercel)
- If the shared code is not bundled, eg written in pure TypeScript, include it in the app bundle.
In Next.js this is done via [next-transpile-modules](https://www.npmjs.com/package/next-transpile-modules) in next.config.js


## Run scripts with Just

[Just](https://github.com/casey/just) is similar to NPM scripts or makefile, but language agnostic, simple and powerful.

Recommended installation with [asdf](https://github.com/asdf-vm/asdf):

```sh
asdf plugin add just
asdf install just latest
asdf global just latest
```

You might need to create the relevant `.tool-versions` files, that defines the
version of Node used by `asdf` (similarly to what .nvmrc do for NVM).

- Run redis (for external and internal API): `just redis`
- Run mongo (for Next and APIs): `just mongo`

## Pnpm with Corepack

The monorepo uses PNPM as its primary package manager.

Since we rely on Node 16+, you can use `yarn` and `pnpm` by enabling the [Corepack](https://nodejs.org/api/corepack.html) feature of Node:

```sh
# If you have Node 16 installed, this will just work
corepack enable
```
### Caveats with pnpm

- If you import a subdependency of a direct dependency, you need to install it explicitly as well. 
For example, `apollo-server-express` depens on `apollo-server-core`. But if you want to use `apollo-server-core` directly in your code, it must be installed. Yarn and NPM were more flexible (but also less reliable).
- The `node_modules` folder structure is altered. This might trick Webpack cache (see the PNPM plugin used for Gatsby) and also our Apollo patch. Subdependencies are located in `node_modules/.pnpm/node_modules`, only direct dependencies of the project are located in `node_modules` (but they also link towards PNPM shared cache)
- You need `preserveSymlinks: true` in tsconfig.


## Services


- ScaleGrid for database hosting: https://scalegrid.io/
11/2022: running on Mongo v4, be careful with compatibility matrix:
https://www.mongodb.com/docs/drivers/node/current/compatibility/#mongodb-compatibility
https://mongoosejs.com/docs/compatibility.html

- Render.com for long running: APIs, admin form
You can configure folders that are relevant for an app (eg "surveyadmin" & "shared") from the UI

Admin area: https://surveyadmin.onrender.com

- Vercel for serverless (surveyform): https://vercel.com/devographics
You can configure folders that are relevant for an app (eg "surveyform" & "shared") via "vercel.json"
@see https://vercel.com/guides/how-do-i-use-the-ignored-build-step-field-on-vercel

- Netlify for homepage and result pages: https://www.netlify.com/

- Stellate for graphql caching: https://stellate.co/

- Apollo Studio for graqphl debugging: https://studio.apollographql.com/

- Sentry for debugging: https://sentry.io/organizations/devographics

- Logtail as the log drain for Vercel: https://logtail.com/team/61764/sources
