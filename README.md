# Devographics Monorepo

This is the codebase that runs the Devographics surveys, such as [State of JS](http://stateofjs.com/) and [State of CSS](https://stateofcss.com/).

## Setup

### 1. Install pnpm

This monorepo uses [pnpm](https://pnpm.io/), and you should start by installing it.

### 2. Clone Repositories

#### A. Install Script

You can clone all repositories in the right place and create blank `.env` files with the following install script:

`curl -o- https://raw.githubusercontent.com/Devographics/Monorepo/main/install.sh | bash`

#### B. Manual Install

##### Monorepo

-   Clone this monorepo locally with `git clone https://github.com/Devographics/Monorepo.git`

##### Other repos

The survey apps rely on a lot of metadata. If you need to load or modify this metadata from your local filesystem instead of through our API, you can optionally also clone these other repos:

1. [entities](https://github.com/Devographics/entities): the YAML files containing all metadata for the features, sites, people, libraries, etc. mentioned in the surveys.
2. [surveys](https://github.com/Devographics/surveys): contains the YAML files that define survey configs and outlines.
3. [locale-en-US](https://github.com/Devographics/locale-en-US): (or any other locale) contains the locale strings used in the survey.

I suggest using the following file structure:

-   `devographics` parent directory
    -   `devographics/monorepo`
        -   `devographics/monorepo/surveyform`
        -   `devographics/monorepo/results`
        -   `devographics/monorepo/...`
    -   `devographics/entities`
    -   `devographics/surveys`
    -   `devographics/locales`
        -   `devographics/locales/locale-en-US`
        -   `devographics/locales/locale-fr-FR`
        -   `devographics/locales/...`

### 3. Install Dependencies

Whenever you need to run a project in the `monorepo` directory (such as `results`, `surveyform`, etc.), you will need to first run `pnpm install` from within its subdirectory.

-   `cd monorepo`
-   `pnpm install`

This will install dependencies for all applications of the monorepository.

### 4. Running a Project

You can run each project with `pnpm run dev` when inside its subdirectory.

For example, for the `surveyform` app:

-   `cd monorepo`
-   `cd surveyform`
-   `pnpm run dev`

If this is your first time running a project, you will run into some issues that need to be fixed by configuring your local environment variables (see below).

#### Remote vs Local API

You can run the `results` and `surveyform` project by connecting to our remote production API (https://api.devographics.com/graphql).

Alternatively, if you want to use local files for the surveys, locales, etc. you will need to run a local copy of the API project (`monorepo/api`) locally as well to load them. Once the API is running, you can then point the other apps to it via the `API_URL` env variable.

Note that even when the API is running locally, you will still need internet access to connect to the databases and load image assets.

### 5. Environment Variables Setup

Each app within `monorepo` needs its own environment variables defined inside a `.env` files (except for `surveyform` and `surveyadmin`, which use a `.env.development.local` file).

Here are some ways that can help with this setup:

1.  You can use the `.env.example` file in each project subdirectory (such as [this one for the surveyform project](https://github.com/Devographics/Monorepo/blob/main/surveyform/.env.example)) as a starting point by pasting its contents into your own `.env` or `.env.development.local` (for Next.js projects such as `surveyform`) file.
2.  You will need credentials to connect to our MongoDB and Redis staging database. You can [ask me (Sacha) on Discord](https://discord.gg/zRDb35jfrt) and I will provide them.
3.  When running the app with `pnpm run dev` you will get error messages indicating any remaining missing environment variables.

You can also refer to [variables.yml](https://github.com/Devographics/Monorepo/blob/main/shared/helpers/variables.yml) directly and look for variables corresponding to the current app (e.g. `results`).

## Apps

The following apps are all contained within the monorepo.

### 📡 API

Node.js TypeScript app.

##### What It Does

-   Make the outlines of each survey available to the survey form app.
-   Connect to the database and generate the data for the results app's charts.
-   Provide the internationalisation strings for each locale.

##### Code

-   https://github.com/Devographics/Monorepo/tree/main/api

##### Hosted On

-   https://render.com

### 🔍 GraphiQL

GraphQL IDE

##### What It Does

-   Make it easier to test and query the API.

##### Code

-   https://github.com/Devographics/Monorepo/tree/main/graphiql

##### Hosted On

-   https://netlify.com

##### Domain

-   https://api.devographics.com

### ✍️ Surveyform

Next.js TypeScript app.

##### What It Does

-   Let respondents take the survey.

##### Code

-   https://github.com/Devographics/Monorepo/tree/main/surveyform

##### Hosted On

-   https://vercel.com

##### Domain

-   https://survey.devographics.com

### 📊 Results

Gatsby TypeScript app.

##### What It Does

-   Display the survey results.

##### Code

-   https://github.com/Devographics/Monorepo/tree/main/results

##### Hosted On

-   https://netlify.com

##### Domains

-   https://2022.stateofjs.com
-   https://2023.stateofcss.com
-   etc.

### 🔒 Surveyadmin

Admin app.

##### What It Does

-   Provide a dashboard to manage all surveys.
-   Handle data processing and normalization.

##### Hosted On

-   Only running locally for now.

---

## Databases

### 🗂️ Main Database

MongoDB database.

##### What It Does

-   Store the raw data entered by respondents.
-   Store the "normalized" data once it's been processed.

##### Hosted On

-   https://www.mongodb.com/atlas/database

##### Local dev

You can plug to a staging database or run Mongo locally via Docker.

See "docker-compose.yml" and "Justfile" for our local setup.
When running locally, data are stored in a ".mongo" folder in the monorepo folder.
You can delete this folder to reset the local database.


### 💾 Cache Database

Redis database.

##### What It Does

-   Cache the results of queries made to the API app.

##### Hosted On

-   https://upstash.com/


##### Local dev

You can plug to a staging database or run Redis locally.

Since we use Upstash, which rely on HTTP requests instead of direct Redis connection,
we also setup an HTTP proxy.

See "docker-compose.yml" and "Justfile" for our local setup.

To reset the local Redis instance, the best approach is to remove the Redis container.

---

## Assets

### 🌐 Locales

Locale strings

##### What It Does

-   Store locale strings for various languages as YAML files.

##### Repos

-   https://github.com/Devographics/locale-en-US
-   https://github.com/Devographics/locale-es-ES
-   https://github.com/Devographics/locale-de-DE
-   etc.

### 📖 Survey Config

Outline and config files for each survey.

##### What It Does

-   Store outline and config files for each survey as YAML files.

##### Repo

-   https://github.com/Devographics/surveys/

##### Domains

-   https://assets.devographics.com

### 🖼️ Static Assets

Static image files.

##### What It Does

-   Store static images such as logos, social media preview images, etc.

##### Repo

-   https://github.com/Devographics/images

##### Hosted On

-   https://netlify.com/

##### Domains

-   https://assets.devographics.com


## Contribute

Emojis to distinguish commits within the monorepo:
- 🅿️ `:parking:` for the whole monorepo ("P" for "Pnpm")
- ⚙  `:gear:` for the shared folder
- 🔍 `:mag:` for graphiql
- 📡 `:satellite:`for the api
- 📊 `:bar_chart:`for the results
- 🏠 `:house:`for the homepage
- ✍ ️`:writing_hand:` for the surveyform
- 🔒 `:lock:` for the surveyadmin
- 🌐 `:globe_with_meridians:` for the locales
- 📖 `:book:` for the surveys
- 🙎 `:person_pouting:` for the entities
- 🖼️ `:frame_photo:` for the images


---

## Env Variables

See "shared/helpers/variables.yml" for a more up to date list.

### API

| Variable  | Description    | Used By |
| --------- | -------------- | ------- |
| `API_URL` | URL of the API | All     |

### MongoDB

| Variable           | Description                                       | Used By    |
| ------------------ | ------------------------------------------------- | ---------- |
| `MONGO_URI`        | URI of the Mongo database                         | All        |
| `MONGO_PRIVATE_DB` | Name of the database where private data is stored | Surveyform |
| `MONGO_PUBLIC_DB`  | Name of the database where public data is stored  | API        |

### Redis

| Variable      | Description                      | Used By    |
| ------------- | -------------------------------- | ---------- |
| `REDIS_URL`   | URL of the Redis database        | Surveyform |
| `REDIS_TOKEN` | Redis token (needed for Upstash) | Surveyform |

### GitHub

| Variable              | Description                                                | Used By      |
| --------------------- | ---------------------------------------------------------- | ------------ |
| `GITHUB_TOKEN`        | GitHub access token                                        | Results      |
| `GITHUB_PATH_SURVEYS` | Path to surveys dir on GitHub (e.g. `org/repo/(subdir)`)   | Results      |
| `GITHUB_PATH_LOCALES` | Path to locales dir on GitHub (e.g. `org/(repo)/(subdir)`) | Results, API |

-   For `GITHUB_PATH_SURVEYS`, the `subdir` segment can be omitted. It will then be assumed that the surveys data is at the root of the repo.
-   For `GITHUB_PATH_LOCALES`, **both** the `repo` and the `subdir` segments can be omitted. It will then be assumed that the locales each have their own separate repo.

### Email

| Variable               | Description                                           | Used By    |
| ---------------------- | ----------------------------------------------------- | ---------- |
| `EMAIL_OCTOPUS_APIKEY` | EmailOctopus API key                                  | Surveyform |
| `DEFAULT_MAIL_FROM`    | Default "from" email (e.g. `info@mail.stateofjs.com`) | Surveyform |
| `SMTP_HOST`            | SMTP host (e.g. `email-smtp.us-east-1.amazonaws.com`) | Surveyform |
| `SMTP_PORT`            | SMTP port (e.g. `465`)                                | Surveyform |
| `SMTP_SECURE`          | Set to "1"                                            | Surveyform |
| `SMTP_USER`            | SMTP username                                         | Surveyform |
| `SMTP_PASS`            | SMTP password                                         | Surveyform |

EMAIL_OCTOPUS_APIKEY

### Other Config

| Variable         | Description                                                     | Used By    |
| ---------------- | --------------------------------------------------------------- | ---------- |
| `ENCRYPTION_KEY` | Encryption key to hash emails                                   | Surveyform |
| `SECRET_KEY`     | Secret key used to verify external webhook requests             | API        |
| `ASSETS_URL`     | URL for static assets (e.g. `https://assets.devographics.com/`) | All        |

### Local Dev

| Variable         | Description                                                               | Used By |
| ---------------- | ------------------------------------------------------------------------- | ------- |
| `SURVEYS_DIR`    | Local directory from which to load survey outlines                        | API     |
| `LOCALES_DIR`    | Local directory from which to load locale files                           | API     |
| `ENTITIES_DIR`   | Local directory from which to load entities files                         | API     |
| `ENABLE_CACHE`   | Set to `false` to always load data from the API                           | All     |
| `PORT`           | Which port to run the app on                                              | All     |
| `LOGS_DIRECTORY` | Absolute path to logs dir (e.g. `/Users/sacha/monorepo/surveyform/.logs`) | All     |

-   If `SURVEYS_DIR` is defined, surveys data will be loaded locally instead of from GitHub.
-   If `LOCALES_DIR` is defined, locales data will be loaded locally instead of from GitHub.
-   If `ENTITIES_DIR` is defined, entities data will be loaded locally instead of from GitHub.
