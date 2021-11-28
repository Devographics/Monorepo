# API

- [data format](#data-format)
    - [type](#type-definition)
    - [example](#example-data)

## Setup

Create an `.env` file at the root of the `api` directory: 

```
# MongoDB connection string and database name
MONGO_URI=***
MONGO_DB_NAME=***

# Keys used to encrypt data and authenticate RPCs
ENCRYPTION_KEY=***
SECRET_KEY=***

# Third party services
SENTRY_DSN=***
GITHUB_TOKEN=***
TWITTER_KEY=***
TWITTER_SECRET_KEY=***
TWITTER_BEARER_TOKEN=***
TWITTER_ACCESS_TOKEN=***
TWITTER_ACCESS_TOKEN_SECRET=***

# Whether to load locales and entities data from GitHub or from a local directory
LOAD_LOCALES=local
LOAD_ENTITIES=local
```

Note: contact me (Sacha) on [Discord](https://discord.gg/zRDb35jfrt) if you need the actual values. 

## Running the App

```
npm run dev
npm run dev:clean # run without cache
```

## Translations

You can use the [GraphQL API](http://localhost:4001/) to get more info about a specific translation locale. Here is a sample query:

```graphql
query GetLocaleData {
  locale(localeId: "ru-RU") {
    completion
    totalCount
    translatedCount
    translators
    untranslatedKeys
  }
}
```
