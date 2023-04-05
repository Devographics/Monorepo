import { NextApiRequest, NextApiResponse } from "next";

export default async function getSectionHandler(req: NextApiRequest, res: NextApiResponse) {
    // TODO: extract logic from FormContainer to compute the right graphql request
    // so we turn this endpoint into a REST endpoint
    // See FormContainer "useFragments" and fragment autogeneration
    return res.status(200).json({})
}