## Rendering mode

- Static: chart image is prerendered statically based on the Gatsby app,
hosted on a cloud service.
This means we don't need to generate the chart at all. 
Nor to serve it as we can host images on a public CDN and access them directly via URL.
We only need to compute the right metadata for the chart.

- Fly: chart is generated on the fly when we serve it, using a GET call (this doesn't allow filtering
because URL length is too limited).
We don't need to store the generated chart.

- Local: chart is generated and stored, using a POST call (this allows filtering).
We need to store generated charts.

- S3: same as local but using a true cloud storage.

## Chart params

This folder is using the megaparam pattern

Example:
```
URL visible by the end user: 
"/fly?lang=fr&section=environment&section=browser"
Gets internally rewritten as as a single route parameter:
"/fly/fr-environment-browser"
```
This allow handling multiple route parameters
without nesting many folders

And also allow to statically render pages
based on cookies, search params, headers...

It relies strongly on extending the root middleware with URL rewrites

https://blog.vulcanjs.org/render-anything-statically-with-next-js-and-the-megaparam-4039e66ffde