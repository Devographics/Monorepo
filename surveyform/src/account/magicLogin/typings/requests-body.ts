export interface MagicLoginSendEmailBody {
    /** User's email, used to send the login emai */
    destination: string;
    /** We can create an unverified account as soon as we send the email */
    anonymousId?: string;
    locale: string;
    /**
     * Optional editionId and surveyId to login to a precise survey
     */
    editionId?: string;
    surveyId?: string;
};