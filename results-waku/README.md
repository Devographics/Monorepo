# results-waku

Minimal Waku app used for the `results` migration.

## Setup

```sh
pnpm install
```

## Development

```sh
pnpm -C results-waku run dev
```

Set env values in `results-waku/.env` (see `.env.example`) before running if you want
locale data from the API.

## Build

```sh
pnpm -C results-waku run build
```

## Start

```sh
pnpm -C results-waku run start
```

## E2E Parity Test

The parity test compares the local app against `https://2025.stateofjs.com/en-US/` by:

- comparing full-page screenshots
- comparing clickable-area distribution and link action maps
- clicking shared actions and checking resulting destinations

```sh
pnpm -C results-waku run test:e2e
```

Optional env vars:

- `REFERENCE_BASE_URL` (default: `https://2025.stateofjs.com`)
- `LOCAL_BASE_URL` (default: `http://localhost:4400`)
- `PARITY_PATH` (default: `/en-US/`)
- `MAX_PIXEL_DIFF_RATIO` (default: `0.03`)
- `MAX_DIMENSION_DELTA_RATIO` (default: `0.02`)
- `MAX_CLICKABLE_COUNT_DELTA_RATIO` (default: `0.15`)
- `MIN_CLICKABLE_GRID_OVERLAP_RATIO` (default: `0.65`)
- `MIN_LINK_ACTION_OVERLAP_RATIO` (default: `0.7`)
- `MAX_ACTION_PROBES` (default: `8`)
