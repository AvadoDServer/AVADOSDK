const ipfsVersion = require("./ipfs/ipfsVersion");

/**
 * Verify the IPFS connection
 * @param {string} ipfsProvider
 */
async function verifyIpfsConnection({ ipfsProvider }) {
  try {
    await ipfsVersion(ipfsProvider);
    console.log("Connection to IPFS successful",ipfsProvider);
  } catch (e) {
    if (e.code === "ENOTFOUND") {
      if (ipfsProvider === "dappnode") {
        error(`Can't connect to DAppNode, check your VPN connection`);
      } else if (ipfsProvider === "infura") {
        error(`Can't connect to Infura's ipfs endpoint`);
      } else {
        error(`Could not reach IPFS provider at ${ipfsProvider}`);
      }
    } else {
      error(`Cannot connect to IPFS server`);
      throw e;
    }
  }
}

function error(msg) {
  console.error("");
  console.error(msg);
  process.exit(1);
}

module.exports = verifyIpfsConnection;
