const { readManifest } = require("../manifest");
const check = require("../check");

function getCurrentLocalVersion({ dir }) {
  // Load manifest
  const manifest = readManifest({ dir });
  check(manifest, "manifest", "object");
  check(manifest.version, "manifest version");
  const currentVersion = manifest.version;

  return currentVersion;
}

module.exports = getCurrentLocalVersion;
