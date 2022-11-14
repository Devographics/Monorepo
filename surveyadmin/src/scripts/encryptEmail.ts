import { createEmailHash } from "~/account/email/api/encryptEmail";

export const encryptEmail__email__hashSalt = async (args) => {
  const { email, hashSalt } = args;
  const unescapedHashSalt = hashSalt.replaceAll('//', '/')
  console.log('// unescapedHashSalt')
  console.log(unescapedHashSalt)
  return createEmailHash(email, unescapedHashSalt);
};
