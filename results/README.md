# Results

The repo for the survey results sites, such as the [2021 State of JS survey](https://2021.stateofjs.com/) site. Powered by [Gatsby](https://www.gatsbyjs.org/).

## Setup

Create an `.env` file at the root of the `/results` directory.

**If the app crash on startup double check the selected survey.

```sh
DATA_API_URL=http://localhost:4030/graphql
INTERNAL_API_URL=http://localhost:4020/graphql
# In prod:
# DATA_API_URL=http://api.devographics.com/graphql
# INTERNAL_API_URL=http://api-internal.devographics.com/graphql

# adapt to current survey edition
SURVEYID=state_of_js
EDITIONID=js2022

# set to true to only build en-US and ru-RU locales
FAST_BUILD=true

# For logging (optional)
LOGS_DIRECTORY="./.logs"
# Mandatory if logging is enabled
SURVEYS_DIR="./surveys"
```

The `FAST_BUILD` option turns off some features to increase build speed during development and testing, such as generating individual block pages and internationalized versions. 

## Running the app

- `yarn`, then
- `yarn dev` or `yarn dev:clean` to run after cleaning all Gatsby caches. 
