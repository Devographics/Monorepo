import { createEmailHash } from "~/account/email/api/encryptEmail";

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
