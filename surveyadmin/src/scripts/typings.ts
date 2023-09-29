
// NOTE: this exists also in surveyform
// but each app should define more precisly which fields it cares about
// so no need to share those types
export interface UserDocument {
    _id: string,
    createdAt: any,
    userId: string
    olderUserId: string,
    email: string,
    emailHash1: string
    emailHash2: string
    emailHash: string
    newUserId: string
}

export interface EmailHash {
    createdAt: any,
    _id: string,
    userId: string,
    hash: string,
    uuid: string,


}