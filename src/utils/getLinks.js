const adminUiBaseUrl = "http://my.ava.do/#";

/**
 * Get link to publish a TX from a txData object
 * @param {object} txData
 */
function publishTx({ txData }) {
  // txData => Admin UI link
  const txDataShortKeys = {
    r: txData.ensName,
    v: txData.currentVersion,
    h: txData.releaseMultiHash
  };
  // Only add developerAddress if necessary to not pollute the link
  if (txData.developerAddress) txDataShortKeys.d = txData.developerAddress;
  return `${adminUiBaseUrl}/sdk/publish/${stringifyUrlQuery(txDataShortKeys)}`;
}

/**
 * Get link to install a DNP from its path
 * @param {string} releaseMultiHash
 */
function installDnp({ releaseMultiHash }) {
  return `${adminUiBaseUrl}/installer/${encodeURIComponent(releaseMultiHash)}`;
}

 function overwriteDnp({ releaseMultiHash }) {
  return `http://go.ava.do/install${releaseMultiHash}`;
}

// Utils

function stringifyUrlQuery(obj) {
  return Object.keys(obj)
    .map(key => `${key}=${encodeURIComponent(obj[key])}`)
    .join("&");
}

module.exports = {
  publishTx,
  installDnp,
  overwriteDnp
};
