## Rendering mode

### Prerendered

In **Prerendered mode**, chart image is prerendered statically based on the Gatsby app,
hosted on a cloud service.

This is the historical architecture that reuses the existing result app and
open graph image generation CLI.


This means we don't need to generate the chart at all. 

Nor to serve it as we can host images on a public CDN and access them directly via URL.
We only need to compute the right metadata for the chart.

### Fly (work in progress for 2024)

In **Fly mode** chart is generated on the fly when we serve it, using a GET call (this doesn't allow filtering because URL length is too limited).

We don't need to store the generated chart.

This has been implemented in the demo "ogserve". 

The difficulty lies in generating and rendering the chart,
which means we have to reuse a lot of code from the existing Gatsby app.

### Local (work in progress for 2024)

Chart is generated and stored, using a POST call (this allows filtering).
We need to store generated charts.

## S3 (work in progress for 2024)

Same as local but using a true cloud storage.

## Chart params

This folder is using the megaparam pattern, 
to allow statically rendering a complex combination of parameters,
without nesting a million folders together.

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