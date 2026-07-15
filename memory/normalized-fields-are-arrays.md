---
name: normalized-fields-are-arrays
description: Devographics normalized DB fields (e.g. *.normalized, *.parents) are always arrays by design
metadata:
  type: project
---

In the devographics monorepo, normalized response fields in MongoDB (paths like `features.foo.normalized` or `features.foo.parents`) are always arrays — per Sacha (2026-07-15), "or at least it should be". So `$isArray`-guarded aggregation expressions are sufficient; no scalar fallback needed for these paths. Also: the module-level `invalidValues` list (`['invalid', 'no_pain_point']`) in `api/src/compute/generic_pipeline.ts` applying globally to all questions is an accepted tradeoff for now.
