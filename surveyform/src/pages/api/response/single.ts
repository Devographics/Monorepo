// TODO: get the response directly in a React Server Component
// instead of an API endpoint (or even route handler)
// as it is never called on demand
import type { NextApiRequest, NextApiResponse } from 'next'

import gql from "graphql-tag"
import { serverConfig } from '~/config/server'
import { print } from 'graphql'
import { ResponseDocument, SurveyEdition } from '@devographics/core-models'
import { connectToAppDb } from '~/lib/server/mongoose/connection'
import { connectToRedis } from '~/lib/server/redis'

export default async function singleResponseHandler(req: NextApiRequest, res: NextApiResponse) {
  await connectToAppDb()
  connectToRedis()
  const editionId = req.query["editionId"]
  if (!editionId) {
    return res.status(400).json({ error: "Missing editionId" })
  }
  // TODO: this code used to be a client-side graphql query
  // we reuse the same call temporarily to facilitate moving out of graphql
  try {
    // TODO: this hack let's us call the existing graphql API until we rewrite the server without graphql
    const headers = {
      ...req.headers,
      "content-type": "application/json"
    }
    delete headers.connection
    const gqlRes = await fetch(serverConfig().appUrl + "/api/graphql", {
      method: "POST",
      // @ts-ignore
      headers,
      // TODO: this query doesn't consider the survey slug
      body: JSON.stringify(
        {
          query: print(gql`
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
          editionId
          completion
          createdAt
          survey {
            slug
            surveyId
            editionId
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
    `)
        }
      )
    })
    if (!gqlRes.ok) {
      console.error("Response text:", await gqlRes.text())
      return res.status(500)
    }
    const data = await gqlRes.json()
    // TODO: filter during call to db already
    const responses: Array<ResponseDocument & { survey: SurveyEdition }> = data?.data?.currentUser?.responses || []
    const surveyResponse = responses.find((r) => r.editionId === editionId) || null;
    return res.status(200).json(surveyResponse)
  } catch (err) {
    console.error("GraphQL fetch error", err)
    return res.status(500)
  }
}