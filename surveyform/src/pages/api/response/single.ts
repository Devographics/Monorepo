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
  const surveySlug = req.query["surveySlug"]
  if (!surveySlug) throw new Error("No survey slug, can't get response")
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
    `)
        }
      )
    })
    if (!gqlRes.ok) {
      console.error("Response text:", await gqlRes.text())
      throw new Error("Error during fetch")
    }
    const data = await gqlRes.json()
    console.log("GOT DATA FROM GRAPHQL CALL", data)
    // TODO: filter during call to db already
    const responses: Array<ResponseDocument & { survey: SurveyEdition }> = data?.data?.currentUser?.responses
    const surveyResponse = responses.find((r) => r.surveySlug === surveySlug) || null;
    console.log("response", surveyResponse, responses)
    return res.status(200).json(surveyResponse)
  } catch (err) {
    console.error("GraphQL fetch error", err)
    return res.status(500)
  }
}