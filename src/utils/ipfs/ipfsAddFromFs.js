const fs = require("fs");
const path = require("path");
const got = require("got");
const FormData = require("form-data");
const traverseDir = require("./traverseDir");
const { normalizeIpfsProvider } = require("./ipfsProvider");

/**
 * Uploads a directory or file from the fs
 * @param {string} dirOrFile "docs"
 * @param {string} ipfsProvider "dappnode" | "http://localhost:5001"
 * @param {(percent: number) => void} [onProgress] Report upload progress, 0.4631
 * @returns {Promise<string>} "/ipfs/Qm..."
 */
async function ipfsAddFromFs(dirOrFile, ipfsProvider, onProgress) {
  // Create form and append all files recursively

  const form = new FormData();
  // Automatically detect if recursive if needed if directory
  if (fs.lstatSync(dirOrFile).isDirectory()) {
    const dirDir = path.parse(dirOrFile).dir;
    const filePaths = traverseDir(dirOrFile);
    for (const filePath of filePaths) {
      form.append(`file-${filePath}`, fs.createReadStream(filePath), {
        // Compute filepaths from the provided dirOrFile and below only
        filepath: path.relative(dirDir, filePath)
      });
    }
  } else {
    // Add single files without providing a filepath
    form.append("file", fs.createReadStream(dirOrFile));
  }

  // Parse the ipfsProvider the a full base apiUrl
  const apiUrl = normalizeIpfsProvider(ipfsProvider);
  const res = await got({
    prefixUrl: apiUrl,
    url: "api/v0/add",
    method: "POST",
    headers: form.getHeaders(),
    body: form
  }).on("uploadProgress", progress => {
    // Report upload progress
    // { percent: 0.9995998225975282, transferred: 733675762, total: 733969480 }
    if (onProgress) onProgress(progress.percent);
  });

  // res.body = '{"Name":"dir/file","Hash":"Qm...","Size":"2203"}\n{"Name":"dir","Hash":"Qm...","Size":"24622"}\n'
  // Trim last \n, split entries by \n and then select the last which is the root directory
  const lastFileUnparsed = res.body
    .trim()
    .split("\n")
    .slice(-1)[0];
  if (!lastFileUnparsed) throw Error(`No files in response body ${res.body}`);

  // Parse the JSON and return the hash of the root directory
  const lastFile = JSON.parse(lastFileUnparsed);
  return `/ipfs/${lastFile.Hash}`;
}

module.exports = ipfsAddFromFs;
