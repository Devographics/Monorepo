import type { NextApiRequest, NextApiResponse } from 'next'

import gql from "graphql-tag"

export default async function responseHandler(req: NextApiRequest, res: NextApiResponse) {
  const surveySlug = req.query["surveySlug"]
  if (!surveySlug) throw new Error("No survey slug, can't get response")
  // TODO: this code used to be a client-side graphql query
  // we reuse the same call temporarily to facilitate moving out of graphql
  const response = await fetch("/api/graphql", {
    method: "POST",
    // @ts-ignore
    headers: req.headers,
    // TODO: this query doesn't consider the survey slug
    body: JSON.stringify(
      {
        query: gql`
      query getCurrentUser {
        currentUser {
          ...UsersCurrentSurveyAction
          __typename
        }
      }

      fragment UsersCurrentSurveyAction on User {
        _id
        username
        createdAt
        isAdmin
        groups
        responses {
          _id
          pagePath
          surveySlug
          completion
          createdAt
          survey {
            slug
            prettySlug
            name
            year
            domain
            status
            imageUrl
            faviconUrl
            socialImageUrl
            resultsUrl
          }
        }
        __typename
      }
    `
      }
    )
  })
  const data = await response.json()
  console.log("GOT DATA FROM GRAPHQL CALL", data)
  // TODO: filter during call to db already
  const responses = []
  const surveyResponse = (responses as any).findOne((r) => r.surveySlug === req.query["slug"]);
  res.status(200).json(surveyResponse)
}