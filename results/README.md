# Results

The repo for the survey results sites, such as the [2021 State of JS survey](https://2021.stateofjs.com/) site. Powered by [Gatsby](https://www.gatsbyjs.org/).

## Setup

Create an `.env` file at the root of the `/results` directory.

```
DATA_API_URL=http://api.devographics.com/graphql
INTERNAL_API_URL=http://api-internal.devographics.com/graphql

# adapt to current survey
SURVEYID=state_of_graphql
EDITIONID=graphql2022

# set to true to only build en-US and ru-RU locales
FAST_BUILD=true
```

The `FAST_BUILD` option turns off some features to increase build speed during development and testing, such as generating individual block pages and internationalized versions. 

## Running the app

- `yarn`, then
- `yarn dev` or `yarn dev:clean` to run after cleaning all Gatsby caches. 
