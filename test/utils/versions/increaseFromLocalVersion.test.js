const expect = require("chai").expect;
const fs = require("fs");
const yaml = require("js-yaml");
const { rmSafe } = require("../../shellSafe");
const increaseFromLocalVersion = require("../../../src/utils/versions/increaseFromLocalVersion");
const { generateAndWriteCompose } = require("../../../src/utils/compose");

// This test will create the following fake files
// ./dappnode_package.json  => fake manifest
//
// Then it will expect the function to
// - log the next version
// - modify the existing manifest and increase its version
// - generate a docker compose with the next version

describe("increaseFromLocalVersion", () => {
  const ensName = "admin.dnp.dappnode.eth";
  const manifest = {
    name: ensName,
    version: "0.1.0",
    avatar: "/ipfs/QmUG9Y13BvmKC4RzFu85F7Ai63emnEYrci4pqbbLxt3mt1",
    type: "dncore",
    image: {
      path: "dnpinner.public.dappnode.eth_0.0.1.tar.xz",
      hash: "/ipfs/QmcgHQ17z1UK4poEXDr4bzhiPPtLKxPEZTgiktXgcy1JJU",
      size: 22019270,
      restart: "always"
    }
  };
  const manifestPath = "./dappnode_package.json";
  const composePath = "./docker-compose.yml";

  before(async () => {
    await rmSafe(manifestPath);
    await rmSafe(composePath);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    generateAndWriteCompose({ manifest });
  });

  it("Should get the last version from APM", async () => {
    const nextVersion = await increaseFromLocalVersion({
      type: "patch",
      ethProvider: "infura"
    });

    // Check that the console output contains a valid semver version
    expect(nextVersion).to.equal(
      "0.1.1",
      "Should output to console the next version"
    );

    // Check that the compose was edited correctly to the next version
    const composeString = fs.readFileSync(composePath, "utf8");
    const compose = yaml.safeLoad(composeString);
    expect(compose.services[ensName].image).to.equal(
      "admin.dnp.dappnode.eth:0.1.1",
      "compose should be edited to the next version"
    );
    // Check that the manifest was edited correctly to the next version
    const newManifestString = fs.readFileSync(manifestPath, "utf8");
    const newManifest = JSON.parse(newManifestString);
    expect(newManifest.version).to.equal(
      "0.1.1",
      "manifest should be edited to the next version"
    );
  }).timeout(60 * 1000);

  after(async () => {
    await rmSafe(manifestPath);
    await rmSafe(composePath);
  });
});
