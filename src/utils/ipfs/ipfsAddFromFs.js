const fs = require("fs");
// const path = require("path");
// const got = require("got");
// const FormData = require("form-data");
// const traverseDir = require("./traverseDir");
const { normalizeIpfsProvider } = require("./ipfsProvider");
const { CliError } = require("../../params");

/**
 * Uploads a directory or file from the fs
 * @param {string} dirOrFile "docs"
 * @param {string} ipfsProvider "dappnode" | "http://localhost:5001"
 * @param {(percent: number) => void} [onProgress] Report upload progress, 0.4631
 * @returns {Promise<string>} "/ipfs/Qm..."
*/
async function ipfsAddFromFs(dirOrFile, ipfsProvider) {
  const { create } = await import('ipfs-http-client')

  // Parse the ipfsProvider the a full base apiUrl
  const apiUrl = normalizeIpfsProvider(ipfsProvider);

  const ipfs = create(new URL(apiUrl))

  if (fs.lstatSync(dirOrFile).isDirectory()) {
    throw new CliError(
      `Directory adding is not supported`
    );
  }

  const { cid } = await ipfs.add(dirOrFile);
  return `/ipfs/${cid}`;

}

module.exports = ipfsAddFromFs;
