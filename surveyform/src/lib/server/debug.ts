//import path from path
import fs from "fs";
import path from "path";
const logsDirectory = ".logs";

/**
 * NOTE: not working on Windows yet
 * @param fileName
 * @param object
 * @param options
 */
export const logToFile = async (
  fileName: string,
  object: string | Object,
  options: { mode?: "append" | "overwrite"; timestamp?: boolean } = {}
) => {
  const { mode = "append", timestamp = false } = options;
  // the server path is of type "/Users/foo/bar/appName/.meteor/local/build/programs/server"
  // we remove the last five segments to get the app directory
  // eslint-disable-next-line no-undef
  const serverDir = process.env.VERCEL
    ? "/tmp"
    : path.resolve(__dirname, "../../../");
  const filePath = serverDir.split(path.sep).slice(1, -5).join(path.sep); //__meteor_bootstrap__.serverDir
  const logsDirPath = `/${filePath}/${logsDirectory}`;
  if (!fs.existsSync(logsDirPath)) {
    fs.mkdirSync(logsDirPath, { recursive: true });
  }
  const fullPath = `${logsDirPath}/${fileName}`;
  const contents =
    typeof object === "string" ? object : JSON.stringify(object, null, 2);
  const now = new Date();
  const text = timestamp ? now.toString() + "\n---\n" + contents : contents;
  if (mode === "append") {
    const stream = fs.createWriteStream(fullPath, { flags: "a" });
    stream.write(text + "\n");
    stream.end();
  } else {
    fs.readFile(fullPath, (error, data) => {
      let shouldWrite = false;
      if (error && error.code === "ENOENT") {
        // the file just does not exist, ok to write
        shouldWrite = true;
      } else if (error) {
        // maybe EACCESS or something wrong with the disk
        throw error;
      } else {
        const fileContent = data.toString();
        if (fileContent !== text) {
          shouldWrite = true;
        }
      }

      if (shouldWrite) {
        fs.writeFile(fullPath, text, (error) => {
          // throws an error, you could also catch it here
          if (error) throw error;

          // eslint-disable-next-line no-console
          console.log(`New graphql schema saved to ${fullPath}`);
        });
      }
    });
  }
};
