 ## Env file

```
# Default values, ok for production
SURVEYS_REPO=surveys

# Dev-only values, change in production
MONGO_URI=mongodb://localhost:27017/devographics

# Values to fill locally
GITHUB_TOKEN=

# Optionally: load entities and surveys from local clones of GitHub repos
# at "../../entities" and "../../surveys"
LOAD_DATA=local
ENTITIES_DIR="entities"
SUVRVEYS_DIR="surveys"
```