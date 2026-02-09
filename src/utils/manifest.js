const fs = require("fs");
const path = require("path");
const check = require("../utils/check");
const { CliError } = require("../params");

const MANIFEST_NAME = "dappnode_package.json";

/**
 * Get manifest path. Without arguments defaults to './dappnode_package.json'
 *
 * @param {Object} kwargs: {
 *   dir: './folder', [optional] directory to load the manifest from
 *   manifestFileName: 'manifest-admin.json', [optional] name of the manifest file
 * }
 * @return {String} path = './dappnode_package.json'
 */
function getManifestPath({
  dir = "./",
  manifestFileName = MANIFEST_NAME
} = {}) {
  return path.resolve(dir, manifestFileName);
}

/**
 * Writes a manifest. Without arguments defaults to write the manifest at './dappnode_package.json'
 *
 * @param {Object} kwargs: {
 *   manifest: <manifest object>
 *   dir: './folder', [optional] directory to load the manifest from
 *   manifestFileName: 'manifest-admin.json', [optional] name of the manifest file
 * }
 */
function writeManifest({ manifest, dir, manifestFileName }) {
  check(manifest, "manifest", "object");
  const path = getManifestPath({ dir, manifestFileName });
  const data = JSON.stringify(manifest, null, 2);
  // If the manifest path is a symlink (e.g. created by setNetwork.sh or git
  // storing symlink content inline), remove it first so we write a regular file.
  try {
    const stat = fs.lstatSync(path);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(path);
    }
  } catch (e) {
    // Ignore if file does not exist yet
    if (e.code !== "ENOENT") throw e;
  }
  fs.writeFileSync(path, data);
}

/**
 * Reads a manifest raw data. Without arguments defaults to read the manifest at './dappnode_package.json'
 *
 * @param {Object} kwargs: {
 *   dir: './folder', [optional] directory to load the manifest from
 *   manifestFileName: 'manifest-admin.json', [optional] name of the manifest file
 * }
 * @return {Object} manifest object
 */
function readManifestString({ dir, manifestFileName } = {}) {
  const path = getManifestPath({ dir, manifestFileName });

  // Recommended way of checking a file existance https://nodejs.org/api/fs.html#fs_fs_exists_path_callback
  let data;
  try {
    data = fs.readFileSync(path, "utf8");
  } catch (e) {
    if (e.code === "ENAMETOOLONG") {
      // Git may store a symlink whose target is the file content itself
      // (instead of a real path). readFileSync fails because the "path" is
      // actually the full JSON string which exceeds the OS filename limit.
      // Read the symlink target to get the content.
      try {
        data = fs.readlinkSync(path);
      } catch (_ignored) {
        throw new CliError(
          `No manifest found at ${path}. Make sure you are in a directory with an initialized DNP.`
        );
      }
    } else if (e.code === "ENOENT") {
      throw new CliError(
        `No manifest found at ${path}. Make sure you are in a directory with an initialized DNP.`
      );
    } else {
      throw e;
    }
  }

  return data;
}

/**
 * Reads a manifest. Without arguments defaults to read the manifest at './dappnode_package.json'
 *
 * @param {Object} kwargs: {
 *   dir: './folder', [optional] directory to load the manifest from
 *   manifestFileName: 'manifest-admin.json', [optional] name of the manifest file
 * }
 * @return {Object} manifest object
 */
function readManifest({ dir, manifestFileName } = {}) {
  const data = readManifestString({ dir, manifestFileName });

  // Parse manifest in try catch block to show a comprehensive error message
  let manifest;
  try {
    manifest = JSON.parse(data);
  } catch (e) {
    throw Error(`Error parsing manifest: ${e.message}`);
  }

  // Return manifest object
  return manifest;
}

function manifestFromCompose(compose) {
  check(compose, "docker-compose object", "object");

  const name = Object.keys(compose.services)[0];
  const version = compose.services[name].image.split(":")[1];
  const service = compose.services[name];

  const manifest = {
    name: name,
    version: version,
    description: "",
    avatar: "",
    type: "",
    image: {
      path: "",
      hash: "",
      size: ""
    },
    author: "",
    license: ""
  };

  if (service.ports) manifest.image.ports = service.ports;
  if (service.volumes) manifest.image.volumes = service.volumes;
  if (service.restart) manifest.image.restart = service.restart;
  console.log(manifest);
  return manifest;
}

module.exports = {
  getManifestPath,
  writeManifest,
  readManifest,
  readManifestString,
  manifestFromCompose
};
