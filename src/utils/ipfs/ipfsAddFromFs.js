const fs = require("fs");
// const path = require("path");
// const got = require("got");
// const FormData = require("form-data");
// const traverseDir = require("./traverseDir");
const { normalizeIpfsProvider } = require("./ipfsProvider");
const IpfsHttpClient = require('ipfs-http-client');
const CID = require("cids");
const { globSource } = IpfsHttpClient;
const { CliError } = require("../../params");

/**
 * Uploads a directory or file from the fs
 * @param {string} dirOrFile "docs"
 * @param {string} ipfsProvider "dappnode" | "http://localhost:5001"
 * @param {(percent: number) => void} [onProgress] Report upload progress, 0.4631
 * @returns {Promise<string>} "/ipfs/Qm..."
 */
async function ipfsAddFromFs(dirOrFile, ipfsProvider) {

  // Parse the ipfsProvider the a full base apiUrl
  const apiUrl = normalizeIpfsProvider(ipfsProvider);

  const ipfs = IpfsHttpClient(new URL(apiUrl))

  if (fs.lstatSync(dirOrFile).isDirectory()) {

    throw new CliError(
      `Directory adding is not supported`
    );

  }

  const { cid } = await ipfs.add(globSource(dirOrFile));
  const myCid = new CID(cid);
  return `/ipfs/${myCid.toString()}`;

}

module.exports = ipfsAddFromFs;
