# Shared modules

## Packages written in typescript

It's ok to use "index.ts" as the "main" of your shared code package.json.

Good news, this means you don't need a build step at package level!

But you expect the app that will consume the package to have TypeScript properly setup.
This is similar to Deno setup for instance, and avoids the "double-bundle" issue:
bundling code that you know will be re-bundled anyway by the application.

If you really need TypeScript, just setup your build system properly.
[Vulcan NPM]() provides good example of complex full-stack packages.


## Use the package

Use [PNPM workspace convention](https://pnpm.io/fr/workspaces):
`"@devographics/encrypt-email: "workspace:*"` will load this package from the shared folder.


## Create a new package

Create a new folder in "shared", run "pnpm init", change the package.json as you need
(namely replace `"main": "index.js"` by `index.ts` or setup typescript).