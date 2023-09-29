
// NOTE: this exists also in surveyform
// but each app should define more precisly which fields it cares about
// so no need to share those types
export interface UserDocument {
    _id: string,
    userId: string
    olderUserId: string,
    email: string,
    emailHash1: string
    emailHash2: string
    emailHash: string
}

export interface EmailHash {
    _id: string,
    userId: string,
    hash: string,
    uuid: string,


}