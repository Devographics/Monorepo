import { getEmailHashesCollection, newMongoId } from "@devographics/mongo";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { EmailHash } from "~/scripts/typings";

/**
 *
 * Creating Hash from Emails, not reversible
 */
export const createEmailHash = (email: string, providedHashSalt?: string) => {
  const hashSaltStr = providedHashSalt || process.env.ENCRYPTION_KEY;

  if (!hashSaltStr)
    throw new Error(`HASH_SALT/ENCRYPTION_KEY environment variable not set`);

  const hashSalt = Buffer.from(hashSaltStr);
  const hash = crypto.createHash("sha512-256WithRSAEncryption");
  hash.update(hashSalt);
  hash.update(email);
  return hash.digest("hex");
};

/**
 * Either get the random UUID associated with an email hash, or store one
 * if it doesn't exist yet
 * @param emailHash String
 */
export async function getUUID(emailHash, userId) {
  const EmailHashes = await getEmailHashesCollection<EmailHash>();
  const hashDoc = await EmailHashes.findOne({ hash: emailHash });
  let emailUuid;
  if (hashDoc) {
    emailUuid = hashDoc.uuid;
  } else {
    emailUuid = uuidv4();
    await EmailHashes.insertOne({
      _id: newMongoId(),
      userId: userId,
      hash: emailHash,
      uuid: emailUuid,
    });
  }
}

/**

Encrypt text
NOTE: NOT SECURE! DO NOT USE unless it's for processing older existing data

@deprecated

*/
export const encrypt = (text) => {
  const encryptionKey = process.env.ENCRYPTION_KEY; // || getSetting('encriptionKey');
  if (!encryptionKey) throw new Error("Encryption not set in this application");
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey),
    "stateofjsstateof"
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString("hex");
};

export const encryptEmail = async ({ email, hashSalt }) => {
  const unescapedHashSalt = hashSalt?.replaceAll("//", "/");
  const salt = unescapedHashSalt || process.env.ENCRYPTION_KEY;
  console.log("// unescapedHashSalt");
  console.log(unescapedHashSalt);
  return {
    email,
    emailHash: createEmailHash(email, salt),
    hashSalt: salt,
  };
};

encryptEmail.args = ["email", "hashSalt"];

encryptEmail.description = `Test out email hashes with any salt. `;
