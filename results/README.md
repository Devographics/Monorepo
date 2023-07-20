# Results

The repo for the survey results sites, such as the [2021 State of JS survey](https://2021.stateofjs.com/) site. Powered by [Gatsby](https://www.gatsbyjs.org/).

## Setup

Create an `.env` file at the root of the `/results` directory.

**If the app crash on startup double check the selected survey.

```sh
APP_NAME=results
GATSBY_API_URL=http://localhost:4030/graphql
# In prod:
# DATA_API_URL=http://api.devographics.com/graphql
# INTERNAL_API_URL=http://api-internal.devographics.com/graphql

# adapt to current survey edition
SURVEYID=state_of_js
EDITIONID=js2022

# set to true to only build en-US and ru-RU locales
FAST_BUILD=true

# For logging (optional)
LOGS_DIRECTORY="/code/devographics/monorepo/.logs"
# Mandatory if logging is enabled
SURVEYS_DIR="/code/devograhics/surveys"
```

The `FAST_BUILD` option turns off some features to increase build speed during development and testing, such as generating individual block pages and internationalized versions. 

## Running the app

- `yarn`, then
- `yarn dev` or `yarn dev:clean` to run after cleaning all Gatsby caches. 
