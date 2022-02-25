# Monorepo

This doc is meant to describe the setup involved in creating a monorepo that supports synchronized publishing of multiple npm packages.

## Yarn Workspaces

Yarn workspaces works great for managing dependencies across multiple packages and allowing packages to reference each other.

### Top level Package JSON

Setup yarn workspaces in `package.json` with:

```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```

Setup the npm scripts:

- Create workspace aliases
- Create start and build scripts for each package

```json
{
  "scripts": {
    "core": "yarn workspace refinerdb",
    "react": "yarn workspace refinerdb-react",
    "start": "npm-run-all --parallel start:core start:react",
    "start:core": "yarn core start",
    "start:react": "yarn react start",
    "build": "yarn build:core && yarn build:react",
    "build:core": "yarn core build",
    "build:react": "yarn react build",
    "test": "yarn test:core",
    "test:core": "yarn core test"
  }
}
```

### Package dependencies

You can reference other monorepo package dependencies with a filepath instead of a version

_`refinerdb-react/package.json`_

```json
{
  "dependencies": {
    "refinerdb": "../refinerdb"
  }
}
```

## Lerna

Lerna works great for synchronized publishing of multiple npm packages.

### Setup

Install `lerna` as a global package `npm i -g lerna`

Run the following from the root of the monorepo

```
lerna init
```

Edit the `lerna.json` to tell it to use Yarn workspaces.

```json
{
  "npmClient": "yarn",
  "useWorkspaces": true
}
```

Install dependencies

```
lerna bootstrap
```

### Publish packages

To publish to npm first make sure you are logged in.

```
npm login
```

Then just make sure you commit all your changes and ru:

To publish a `next` version

```
lerna publish --dist-tag next
```

To publish a `latest` version

```
lerna publish
```

## Yarn/NPM Link

You might get get an error about duplicate React instances. If so:

1. CD into the consuming projects `node_modules` and then

```
cd my-consuming-app/node_modules/react
yarn link

cd my-consuming-app/node_modules/react-dom
yarn link

cd refinerdb/packages/refinerdb-react
yarn link react
yarn link react-dom
```

Don't for get to unlink in refinerdb!

```
cd refinerdb/packages/refinerdb-react
yarn unlink react
yarn unlink react-dom
```
