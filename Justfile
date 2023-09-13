# https://github.com/casey/just

# @see https://github.com/Devographics/Monorepo/pull/114
# Gatsby result app is currently opted-out of PNPM because of the patch on Apollo client needed for Next
install:
    pnpm install;
    cd {{justfile_directory()}}/results yarn install;

# @see https://www.npmjs.com/package/concurrently
# @see https://stackoverflow.com/questions/47207616/auto-remove-container-with-docker-compose-yml
# It is not currently possible to automatically remove containers using docker-compose.yml
# so it's easier tp run both commands concurrently
# Exec from justfile_directly so we avoid having .mongo everywhere
dbs:
    cd {{justfile_directory()}} && docker-compose up

# Dropping the Mongo data might be necessary after a version upgrade
drop-dbs:
    sudo rm -Rf .mongo


# (nx experiment) Create local build
# Don't forget to run Redis and Mongo dbs
# build:
#     pnpm exec nx run-many --target=build
#     cd {{justfile()}}/result yarn run build;

default:
    @just --list --justfile {{justfile()}}

docker-build-surveyadmin:
    docker build -f ./docker/surveyadmin.prod.dockerfile -t surveyadmin .

docker-run-surveyadmin:
    docker run -p 3000:3000 --env-file {{justfile_directory()}}/surveyadmin/.env.development -it surveyadmin:latest

