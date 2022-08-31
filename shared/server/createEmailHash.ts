import crypto from "crypto";

/**
 * Creating Hash from Emails, not reversible
 */
export const createEmailHash = (email: string) => {
  const hashSaltStr = process.env.HASH_SALT ||
    //getSetting('hashSalt') ||
    process.env.ENCRYPTION_KEY; //||
  //getSetting('encriptionKey')
  if (!hashSaltStr) {
    throw new Error(`HASH_SALT/ENCRYPTION_KEY environment variable not set`);
  }

  const hashSalt = Buffer.from(hashSaltStr);
  const hash = crypto.createHash("sha512-256WithRSAEncryption");
  hash.update(hashSalt);
  hash.update(email);
  return hash.digest("hex");
};
