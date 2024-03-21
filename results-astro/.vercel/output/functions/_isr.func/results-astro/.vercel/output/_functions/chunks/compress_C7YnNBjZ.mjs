import { gzip as gzip$1, gunzip as gunzip$1 } from 'zlib';
import { promisify } from 'util';

const gzip = promisify(gzip$1);
async function compressJSON(data) {
  try {
    const jsonString = JSON.stringify(data);
    const compressedBuffer = await gzip(jsonString);
    const base64String = compressedBuffer.toString("base64");
    return base64String;
  } catch (err) {
    console.error("Error compressing JSON", err);
    throw err;
  }
}
const gunzip = promisify(gunzip$1);
async function decompressJSON(compressedString) {
  try {
    const compressedBuffer = Buffer.from(compressedString, "base64");
    const decompressedBuffer = await gunzip(compressedBuffer);
    const jsonString = decompressedBuffer.toString();
    const data = JSON.parse(jsonString);
    return data;
  } catch (err) {
    console.error("Error decompressing JSON", err);
    throw err;
  }
}

export { compressJSON, decompressJSON };
