# State of JS 2020 report

The repo for the [2020 State of JS survey](https://2020.stateofjs.com/) site. Powered by [Gatsby](https://www.gatsbyjs.org/).

## Setup

1. Create `.env` file at the root of this repo.
2. Add the following line*: `API_URL=http://api.stateofjs.com/graphql`
3. `yarn`

## Selecting a survey

This monorepo contains all our survey results sites going forward. To activate a specific survey add `SURVEY=js2020` or `SURVEY=css2020` in `.env`. 

## Running the app

- `yarn dev`
- `yarn dev:clean` to run after cleaning all Gatsby caches. 
