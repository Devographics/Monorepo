 ## Env file

```sh
# APP_NAME can be used by shared code
APP_NAME="api"

SURVEYS_REPO=surveys
MONGO_PUBLIC_URI=mongodb://localhost:27017/devographics
MONGO_PUBLIC_DB=devographics_public

REDIS_URL=redis://localhost:6379
REDIS_UPSTASH_URL=http://localhost:8080
REDIS_TOKEN=fake-dev-token

GITHUB_PATH_SURVEYS=devographics/surveys
GITHUB_PATH_LOCALES=devographics/locales
GITHUB_PATH_ENTITIES=devographics/entities

SECRET_KEY=dev-secret-key

GITHUB_TOKEN=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

LOGS_PATH="/code/devographics/monorepo/api/.logs"
# To avoid calling github during local dev
LOAD_DATA=local
ENTITIES_PATH="/code/devographics/entities"
SURVEYS_PATH="/code/devographics/surveys"
LOCALES_PATH="/code/devographics/locales"
```