# https://github.com/casey/just

# For external and internal APIs
redis:
    docker run --rm -p 6379:6379 --label devographics-redis redis

# For Next surveyform and APIs
# Use Compass to access the DB via GUI
mongo:
    docker run --rm -p 27017:27017 -v "$(pwd)"/.mongo:/data/db --label devographics-mongodb mongo:4.0.4

default:
    @just --list --justfile {{justfile()}}