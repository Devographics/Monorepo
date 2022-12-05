# API

## Setup

Create an `.env` file at the root of the `api` directory: 

```
# MongoDB connection string and database name
MONGO_URI=mongodb+srv://user:***@server_name/public
MONGO_DB_NAME=public
```

Note: contact me (Sacha) on [Discord](https://discord.gg/zRDb35jfrt) if you need the actual values. 

Third party services env variables (not usually needed):

```
# Third party services 
SENTRY_DSN=***
GITHUB_TOKEN=***
TWITTER_KEY=***
TWITTER_SECRET_KEY=***
TWITTER_BEARER_TOKEN=***
TWITTER_ACCESS_TOKEN=***
TWITTER_ACCESS_TOKEN_SECRET=***
```

## Running the App

In `/api`: 

```
pnpm install
pnpm run dev
pnpm run dev:clean # run without cache
```