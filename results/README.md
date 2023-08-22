# Results

The repo for the survey results sites, such as the [2022 State of JS survey](https://2022.stateofjs.com/) site. Powered by [Gatsby](https://www.gatsbyjs.org/).

## Running the app locally

/!\ Currently (08/2023) loading the homepage locally will crash in dev and build mode

Instead load the app with a locale:
http://localhost:8001/en-US




## Setup

Create an `.env` file at the root of the `/results` directory.

```sh
# General

APP_NAME=results

# connect to API running locally
GATSBY_API_URL=http://localhost:4020/graphql

# - OR -

# connect to production Devographics API
GATSBY_API_URL=https://api.devographics.com/graphql

# Results

# could be state_of_js, state_of_css, etc.
SURVEYID=state_of_js
# could be js2021, js2022, css2022, etc.
EDITIONID=js2022
# used to fetch surveys data when fetching remotely
SURVEYS_URL=https://devographics.github.io/surveys

# Local Dev

# port for local development
PORT=8001
# used to store logs, useful for debugging
LOGS_PATH=/local_path_to_devographics_directory/monorepo/results/.logs
# used to fetch surveys data when fetching locally
SURVEYS_PATH=/local_path_to_devographics_directory/devographics/surveys
# enable to load fewer locales and speed up build
FAST_BUILD=true
# enable to disable cache and always load fresh data
# DISABLE_CACHE=true

# Redis

# if needed, ask on Discord https://discord.gg/zRDb35jfrt
REDIS_UPSTASH_URL=https://xxxxxx.upstash.io
REDIS_TOKEN=AZLSASQgODxxxxxx=

# Twitter

# if needed, ask on Discord https://discord.gg/zRDb35jfrt
TWITTER_BEARER_TOKEN=AAAAAxxxxxx

# SendOwl

# if needed, ask on Discord https://discord.gg/zRDb35jfrt
SENDOWL_API_KEY=3df5f6xxxx
SENDOWL_SECRET=6475422baxxxxx
```
