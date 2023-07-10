# Devographics Monorepo

## Apps

The following apps are all contained within the monorepo.

### 📡 API

Node.js TypeScript app.

##### What It Does

-   Make the outlines of each survey available to the survey form app.
-   Connect to the database and generate the data for the results app's charts.
-   Provide the internationalisation strings for each locale.

##### Code

-   https://github.com/Devographics/Monorepo/tree/main/api2

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

### 💾 Cache Database

Redis database.

##### What It Does

-   Cache the results of queries made to the API app.

##### Hosted On

-   https://upstash.com/

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

---

## Env Variables

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

| Variable              | Description                                      | Used By |
| --------------------- | ------------------------------------------------ | ------- |
| `GITHUB_TOKEN`        | GitHub access token                              | Results |
| `GITHUB_SURVEYS_USER` | Path to JSON version of results on GitHub (user) | Results |
| `GITHUB_SURVEYS_REPO` | Path to JSON version of results on GitHub (repo) | Results |

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

| Variable         | Description                                         | Used By    |
| ---------------- | --------------------------------------------------- | ---------- |
| `ENCRYPTION_KEY` | Encryption key to hash emails                       | Surveyform |
| `SECRET_KEY`     | Secret key used to verify external webhook requests | API        |

### Local Dev

| Variable      | Description                                        | Used By |
| ------------- | -------------------------------------------------- | ------- |
| `SURVEYS_DIR` | Local directory from which to load survey outlines | API     |
| `LOCALES_DIR` | Local directory from which to load locale files    | API     |
