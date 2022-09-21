// Check the email content
// TODO: not the best regexp in the world... we match the href part of the html link, with the last "
export const magicLinkRegex = `(http|https)://(?<domain>.+)/account/magic-login\\?token=.*"`;
