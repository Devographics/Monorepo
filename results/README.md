# Results

The repo for the survey results sites, such as the [2020 State of JS survey](https://2020.stateofjs.com/) site. Powered by [Gatsby](https://www.gatsbyjs.org/).

## Setup

Create an `.env` file at the root of the `/results` directory.

```
API_URL=http://api.stateofjs.com/graphql
SURVEY=css2021
FAST_BUILD=true
```

Other possible values for the `API_URL` variable:

- `http://localhost:4000/graphql` to use a locally running API. 
- `http://api-staging.stateofjs.com/graphql` to use the staging API. 

The Gatsby app powers all our survey results sites going forward. To activate a specific survey add `SURVEY=js2020` or `SURVEY=css2020` in `.env`. 

The `FAST_BUILD` option turns off some features to increase build speed during development and testing, such as generating individual block pages and internationalized versions. 

## Running the app

- `yarn dev`
- `yarn dev:clean` to run after cleaning all Gatsby caches. 
